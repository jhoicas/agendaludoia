// Package logger provides a pre-configured structured logger for AgendaLudoia.
package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// New creates a new zap.Logger configured for the given environment.
// In production, it outputs JSON; in development, it outputs human-readable format.
func New(env string) (*zap.Logger, error) {
	switch env {
	case "production":
		return zap.NewProduction()
	case "development":
		config := zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		return config.Build()
	default:
		return zap.NewDevelopment()
	}
}

// Must creates a logger or panics. Use only during initialization.
func Must(env string) *zap.Logger {
	logger, err := New(env)
	if err != nil {
		panic("failed to initialize logger: " + err.Error())
	}
	return logger
}

// Env returns the current environment from the APP_ENV variable.
func Env() string {
	env := os.Getenv("APP_ENV")
	if env == "" {
		return "development"
	}
	return env
}
