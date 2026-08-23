// Package entity contains the core domain entities for AgendaLudoia.
// These are pure domain objects with no external dependencies.
package entity

import (
	"time"

	"github.com/google/uuid"
)

// Tenant represents a clinic or organization in the multitenant system.
// Each tenant has isolated data enforced by PostgreSQL RLS policies.
type Tenant struct {
	ID        uuid.UUID         `json:"id"`
	Name      string            `json:"name"`
	Slug      string            `json:"slug"`
	Plan      TenantPlan        `json:"plan"`
	Settings  TenantSettings    `json:"settings"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
}

// TenantPlan represents the subscription tier of a tenant.
type TenantPlan string

const (
	PlanFree       TenantPlan = "free"
	PlanStarter    TenantPlan = "starter"
	PlanProfessional TenantPlan = "professional"
	PlanEnterprise TenantPlan = "enterprise"
)

// TenantSettings holds configurable options for a clinic.
type TenantSettings struct {
	Timezone              string `json:"timezone"`
	DefaultSlotDuration   int    `json:"default_slot_duration_minutes"`
	CancellationWindowH   int    `json:"cancellation_window_hours"`
	AllowPatientSelfBook  bool   `json:"allow_patient_self_book"`
	NoShowPenaltyEnabled  bool   `json:"no_show_penalty_enabled"`
	NoShowPenaltyAmount   int    `json:"no_show_penalty_amount_cents"`
}
