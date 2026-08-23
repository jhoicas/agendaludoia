// Package middleware contains HTTP/gRPC middleware for AgendaLudoia.
package middleware

import (
	"context"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	supabasedb "github.com/agendaLudoia/backend/internal/infrastructure/persistence/supabase"
)

// TenantInterceptor extracts tenant_id and user claims from the gRPC metadata
// (Authorization header / JWT) and injects them into the context for RLS.
func TenantInterceptor(logger *zap.Logger) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Error(codes.Unauthenticated, "missing metadata")
		}

		// Extract Authorization header
		authHeader := md.Get("authorization")
		if len(authHeader) == 0 {
			return nil, status.Error(codes.Unauthenticated, "missing authorization header")
		}

		token := strings.TrimPrefix(authHeader[0], "Bearer ")
		if token == authHeader[0] {
			return nil, status.Error(codes.Unauthenticated, "invalid authorization format")
		}

		// TODO: Validate JWT token using Supabase Auth secret
		// For now, extract claims from the token payload
		// In production, use crypto/jwt verification against SUPABASE_JWT_SECRET

		claims := supabasedb.RLSClaims{
			// TODO: Parse from validated JWT
			Sub:      "",
			Role:     "authenticated",
			TenantID: "",
		}

		_ = token // Will be used for JWT validation

		// Inject claims into context for downstream use
		ctx = supabasedb.ContextWithClaims(ctx, claims)

		logger.Debug("tenant context injected",
			zap.String("method", info.FullMethod),
			zap.String("tenant_id", claims.TenantID),
		)

		return handler(ctx, req)
	}
}
