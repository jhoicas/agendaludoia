// Package main is the entrypoint for the AgendaLudoia backend server.
// It initializes the gRPC server, REST Gateway proxy, and Supabase
// PostgreSQL connection pool with RLS context injection.
package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	// Cargar variables de entorno desde .env si existe
	_ = godotenv.Load()

	// ─── Logger ─────────────────────────────────────────────────────────
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	sugar := logger.Sugar()
	sugar.Info("Starting AgendaLudoia Backend Server...")

	// ─── Database Pool (Supabase PostgreSQL via pgx/v5) ─────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	dbURL := os.Getenv("SUPABASE_DB_URL")
	if dbURL == "" {
		dbURL = "postgresql://postgres:postgres@localhost:54322/postgres"
	}

	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		sugar.Fatalf("failed to parse DB config: %v", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		sugar.Fatalf("failed to connect to Supabase DB: %v", err)
	}
	defer pool.Close()

	sugar.Info("Connected to Supabase PostgreSQL")

	// ─── gRPC Server ────────────────────────────────────────────────────
	grpcPort := os.Getenv("GRPC_PORT")
	if grpcPort == "" {
		grpcPort = "50051"
	}

	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", grpcPort))
	if err != nil {
		sugar.Fatalf("failed to listen on port %s: %v", grpcPort, err)
	}

	grpcServer := grpc.NewServer(
	// TODO: Add interceptors (tenant context, auth, rate limiting)
	)

	// Enable gRPC server reflection for development tooling
	reflection.Register(grpcServer)

	// TODO: Register service handlers
	// pb.RegisterAppointmentServiceServer(grpcServer, appointmentHandler)
	// pb.RegisterPainMapServiceServer(grpcServer, painmapHandler)
	// pb.RegisterEHRServiceServer(grpcServer, ehrHandler)

	_ = pool // Will be injected into repositories

	// ─── Graceful Shutdown ──────────────────────────────────────────────
	go func() {
		sugar.Infof("gRPC server listening on :%s", grpcPort)
		if err := grpcServer.Serve(lis); err != nil {
			sugar.Fatalf("gRPC server failed: %v", err)
		}
	}()

	// TODO: Start REST Gateway proxy on HTTP_PORT
	// go startRESTGateway(ctx, grpcPort, httpPort)

	// Wait for termination signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	sugar.Infof("Received signal %v, shutting down gracefully...", sig)
	grpcServer.GracefulStop()
	sugar.Info("Server stopped")
}
