// Package repository defines the interfaces for data persistence.
// Following DIP, these are defined in the domain layer and implemented
// in the infrastructure layer.
package repository

import (
	"context"

	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
)

// TenantReader provides read operations for tenants.
type TenantReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Tenant, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Tenant, error)
}

// TenantWriter provides write operations for tenants.
type TenantWriter interface {
	Create(ctx context.Context, tenant *entity.Tenant) error
	Update(ctx context.Context, tenant *entity.Tenant) error
}

// TenantRepository combines read and write operations for tenants.
type TenantRepository interface {
	TenantReader
	TenantWriter
}
