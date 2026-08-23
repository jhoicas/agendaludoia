// Package supabase provides the PostgreSQL connection pool for Supabase
// using pgx/v5 with high-performance prepared statements.
package supabase

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Config holds the connection parameters for the Supabase PostgreSQL database.
type Config struct {
	// DatabaseURL is the full connection string to Supabase Postgres.
	// Example: "postgresql://postgres:postgres@localhost:54322/postgres"
	DatabaseURL string

	// MaxConns is the maximum number of connections in the pool.
	MaxConns int32

	// MinConns is the minimum number of idle connections maintained.
	MinConns int32

	// MaxConnLifetime is the maximum duration a connection can live before being recycled.
	MaxConnLifetime time.Duration
}

// DefaultConfig returns a development-ready configuration for Supabase local.
func DefaultConfig() Config {
	return Config{
		DatabaseURL:     "postgresql://postgres:postgres@localhost:54322/postgres",
		MaxConns:        25,
		MinConns:        5,
		MaxConnLifetime: 30 * time.Minute,
	}
}

// NewPool creates a new pgxpool.Pool configured for Supabase PostgreSQL.
// The pool supports concurrent access and is safe for use across goroutines.
func NewPool(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("parsing database config: %w", err)
	}

	poolConfig.MaxConns = cfg.MaxConns
	poolConfig.MinConns = cfg.MinConns
	poolConfig.MaxConnLifetime = cfg.MaxConnLifetime

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("creating connection pool: %w", err)
	}

	// Verify connectivity
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("pinging database: %w", err)
	}

	return pool, nil
}
