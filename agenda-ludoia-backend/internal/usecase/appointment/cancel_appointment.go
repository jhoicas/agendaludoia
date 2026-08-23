// Package appointment contains the business logic for appointment management.
package appointment

import (
	"context"
	"fmt"
	"time"

	"github.com/agendaLudoia/backend/internal/domain"
	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/agendaLudoia/backend/internal/domain/repository"
	"github.com/agendaLudoia/backend/internal/domain/valobj"
	"github.com/google/uuid"
)

// CancelUseCase handles the business logic for cancelling appointments,
// enforcing the inviolable 24-hour cancellation rule.
type CancelUseCase struct {
	repo               repository.AppointmentRepository
	cancellationWindow valobj.CancellationWindow
}

// NewCancelUseCase creates a new CancelUseCase with the default 24-hour window.
func NewCancelUseCase(repo repository.AppointmentRepository) *CancelUseCase {
	return &CancelUseCase{
		repo:               repo,
		cancellationWindow: valobj.NewCancellationWindow(valobj.DefaultCancellationWindowHours),
	}
}

// NewCancelUseCaseWithWindow creates a CancelUseCase with a custom window (for tenant overrides).
func NewCancelUseCaseWithWindow(repo repository.AppointmentRepository, windowHours int) *CancelUseCase {
	return &CancelUseCase{
		repo:               repo,
		cancellationWindow: valobj.NewCancellationWindow(windowHours),
	}
}

// Execute attempts to cancel an appointment. It enforces:
// 1. The appointment must exist
// 2. The appointment must be in a cancellable state (booked or confirmed)
// 3. The cancellation must be outside the 24-hour blackout window
//
// If Δt < 24h, returns domain.ErrCancellationWindowExpired and the
// appointment status remains unchanged (admin must handle manually).
func (uc *CancelUseCase) Execute(ctx context.Context, tenantID string, appointmentID string, now time.Time) error {
	apptUUID, err := uuid.Parse(appointmentID)
	if err != nil {
		return fmt.Errorf("%w: invalid appointment ID", domain.ErrInvalidInput)
	}

	appt, err := uc.repo.GetByID(ctx, apptUUID)
	if err != nil {
		return fmt.Errorf("fetching appointment: %w", err)
	}
	if appt == nil {
		return domain.ErrAppointmentNotFound
	}

	// Verify tenant isolation at the application level (defense in depth)
	tenantUUID, err := uuid.Parse(tenantID)
	if err != nil {
		return fmt.Errorf("%w: invalid tenant ID", domain.ErrInvalidInput)
	}
	if appt.TenantID != tenantUUID {
		return domain.ErrTenantMismatch
	}

	// Check if appointment is in a cancellable state
	if !appt.IsCancellable() {
		return domain.ErrAppointmentNotCancellable
	}

	// Enforce the 24-hour cancellation window
	if err := uc.cancellationWindow.CanCancel(appt.StartTime, now); err != nil {
		return err
	}

	// Proceed with cancellation
	if err := uc.repo.UpdateStatus(ctx, apptUUID, entity.StatusCancelled, "patient_cancelled"); err != nil {
		return fmt.Errorf("updating appointment status: %w", err)
	}

	return nil
}
