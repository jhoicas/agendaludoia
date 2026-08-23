package middleware

import (
	"net/http"
	"sync"
	"time"

	"go.uber.org/zap"
)

// RateLimiter implements a simple token bucket rate limiter per IP.
type RateLimiter struct {
	logger   *zap.Logger
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // requests per window
	window   time.Duration // time window
}

type visitor struct {
	tokens    int
	lastReset time.Time
}

// NewRateLimiter creates a rate limiter with the given rate and window.
func NewRateLimiter(logger *zap.Logger, rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		logger:   logger,
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
	}

	// Cleanup stale entries periodically
	go rl.cleanup()

	return rl
}

// Middleware returns an HTTP middleware that enforces rate limiting.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		if !rl.allow(ip) {
			rl.logger.Warn("rate limit exceeded", zap.String("ip", ip))
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[key]
	now := time.Now()

	if !exists || now.Sub(v.lastReset) > rl.window {
		rl.visitors[key] = &visitor{tokens: rl.rate - 1, lastReset: now}
		return true
	}

	if v.tokens > 0 {
		v.tokens--
		return true
	}

	return false
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, v := range rl.visitors {
			if now.Sub(v.lastReset) > rl.window*2 {
				delete(rl.visitors, key)
			}
		}
		rl.mu.Unlock()
	}
}
