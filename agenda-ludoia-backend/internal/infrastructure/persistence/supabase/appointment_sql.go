// Package supabase contains SQL implementations of domain repository interfaces
// using Supabase PostgreSQL via pgx/v5 with parameterized queries.
package supabase

import (
	"context"
	"fmt"

	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AppointmentSQL implements repository.AppointmentRepository using Supabase PostgreSQL.
// All queries use parameterized statements ($1, $2, etc.) to prevent SQL injection.
// RLS policies handle tenant isolation at the database level.
type AppointmentSQL struct {
	pool *pgxpool.Pool
}

// NewAppointmentSQL creates a new AppointmentSQL repository.
func NewAppointmentSQL(pool *pgxpool.Pool) *AppointmentSQL {
	return &AppointmentSQL{pool: pool}
}

// GetByID retrieves an appointment by its UUID.
// RLS policies automatically filter by tenant_id from the JWT claims.
func (r *AppointmentSQL) GetByID(ctx context.Context, id uuid.UUID) (*entity.Appointment, error) {
	query := `
		SELECT id, tenant_id, patient_id, professional_id, start_time, end_time,
		       status, cancellation_reason, created_at, updated_at
		FROM appointments
		WHERE id = $1
	`

	var appt entity.Appointment
	var cancellationReason *string

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&appt.ID, &appt.TenantID, &appt.PatientID, &appt.ProfessionalID,
		&appt.StartTime, &appt.EndTime, &appt.Status,
		&cancellationReason, &appt.CreatedAt, &appt.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("querying appointment %s: %w", id, err)
	}

	if cancellationReason != nil {
		appt.CancellationReason = *cancellationReason
	}

	return &appt, nil
}

// UpdateStatus changes the status of an appointment with an optional reason.
func (r *AppointmentSQL) UpdateStatus(ctx context.Context, id uuid.UUID, status entity.AppointmentStatus, reason string) error {
	query := `
		UPDATE appointments
		SET status = $1, cancellation_reason = $2, updated_at = now()
		WHERE id = $3
	`

	tag, err := r.pool.Exec(ctx, query, status, reason, id)
	if err != nil {
		return fmt.Errorf("updating appointment status: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("appointment %s not found or not accessible", id)
	}

	return nil
}

// TODO: Implement remaining methods (Create, ListByPatient, ListByProfessional, IsSlotAvailable)
