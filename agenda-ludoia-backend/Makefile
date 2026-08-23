.PHONY: build test proto-gen lint supabase-start supabase-migrate clean

# ─── Variables ───────────────────────────────────────────────────────────────
GO      := go
BUF     := buf
BINARY  := bin/agenda-ludoia-server

# ─── Build ───────────────────────────────────────────────────────────────────
build:
	$(GO) build -o $(BINARY) ./cmd/server/

clean:
	rm -rf bin/

# ─── Test ────────────────────────────────────────────────────────────────────
test:
	$(GO) test ./... -v -race -cover

test-short:
	$(GO) test ./... -short -v

# ─── Protobuf Generation ────────────────────────────────────────────────────
proto-gen:
	cd proto && $(BUF) generate

proto-lint:
	cd proto && $(BUF) lint

proto-breaking:
	cd proto && $(BUF) breaking --against '.git#subdir=proto'

# ─── Supabase ────────────────────────────────────────────────────────────────
supabase-start:
	supabase start

supabase-stop:
	supabase stop

supabase-migrate:
	supabase db push

supabase-reset:
	supabase db reset

supabase-diff:
	supabase db diff -f $(name)

# ─── Lint & Security ────────────────────────────────────────────────────────
lint:
	golangci-lint run ./...

security:
	gosec ./...

# ─── All ─────────────────────────────────────────────────────────────────────
all: proto-gen build test
