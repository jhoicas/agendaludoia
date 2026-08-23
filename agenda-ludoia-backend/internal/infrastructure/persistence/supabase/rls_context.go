package supabase

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RLSClaims represents the JWT claims that Supabase RLS policies evaluate.
// These are injected into each PostgreSQL transaction via set_config so that
// functions like auth.jwt() and requesting_tenant_id() work correctly
// when connecting directly via pgx instead of through PostgREST.
type RLSClaims struct {
	Sub      string `json:"sub"`                // Supabase Auth user ID
	Role     string `json:"role"`               // PostgreSQL role ("authenticated", "anon")
	TenantID string `json:"tenant_id"`          // Custom claim for tenant isolation
	Email    string `json:"email,omitempty"`     // Optional: user email
}

// WithRLSContext starts a transaction and injects the JWT claims into the
// PostgreSQL session, ensuring that all RLS policies evaluate correctly.
//
// IMPORTANT: The `is_local` parameter (true) in set_config ensures the
// setting is scoped to the current transaction only, preventing claim
// leakage across pooled connections.
//
// Usage:
//
//	err := rls.WithRLSContext(ctx, pool, claims, func(tx pgx.Tx) error {
//	    rows, err := tx.Query(ctx, "SELECT * FROM appointments")
//	    // RLS automatically filters by tenant_id
//	    return err
//	})
func WithRLSContext(ctx context.Context, pool *pgxpool.Pool, claims RLSClaims, fn func(tx pgx.Tx) error) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("beginning transaction: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Serialize claims to JSON
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return fmt.Errorf("marshaling RLS claims: %w", err)
	}

	// Inject claims into PostgreSQL session (transaction-scoped)
	_, err = tx.Exec(ctx, "SELECT set_config('request.jwt.claims', $1, true)", string(claimsJSON))
	if err != nil {
		return fmt.Errorf("setting JWT claims in session: %w", err)
	}

	// Set the role to 'authenticated' so RLS policies for authenticated users apply
	_, err = tx.Exec(ctx, "SET LOCAL ROLE authenticated")
	if err != nil {
		return fmt.Errorf("setting local role: %w", err)
	}

	// Execute the business logic within the RLS-protected transaction
	if err := fn(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// ClaimsFromContext extracts RLS claims from a context.
// This is used by gRPC interceptors to pass claims through the request chain.
func ClaimsFromContext(ctx context.Context) (RLSClaims, bool) {
	claims, ok := ctx.Value(rlsClaimsKey{}).(RLSClaims)
	return claims, ok
}

// ContextWithClaims injects RLS claims into a context.
func ContextWithClaims(ctx context.Context, claims RLSClaims) context.Context {
	return context.WithValue(ctx, rlsClaimsKey{}, claims)
}

type rlsClaimsKey struct{}
