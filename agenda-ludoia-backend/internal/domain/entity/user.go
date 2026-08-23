package entity

import (
	"time"

	"github.com/google/uuid"
)

// Role represents the authorization level of a user within a tenant.
type Role string

const (
	RoleSuperAdmin  Role = "super_admin"
	RoleClinicAdmin Role = "clinic_admin"
	RolePhysio      Role = "physio"
	RolePatient     Role = "patient"
)

// User represents a person within a tenant (professional, patient, or admin).
// The ID maps to Supabase Auth's auth.users.id for JWT claim correlation.
type User struct {
	ID        uuid.UUID `json:"id"`
	TenantID  uuid.UUID `json:"tenant_id"`
	Role      Role      `json:"role"`
	FullName  string    `json:"full_name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// IsProfessional returns true if the user can manage appointments and clinical records.
func (u *User) IsProfessional() bool {
	return u.Role == RolePhysio || u.Role == RoleClinicAdmin
}

// IsAdmin returns true if the user has administrative privileges.
func (u *User) IsAdmin() bool {
	return u.Role == RoleSuperAdmin || u.Role == RoleClinicAdmin
}
