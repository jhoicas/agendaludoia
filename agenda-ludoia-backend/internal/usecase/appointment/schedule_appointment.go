package appointment

import (
	"context"
	"fmt"
	"time"

	"github.com/agendaLudoia/backend/internal/domain"
	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/agendaLudoia/backend/internal/domain/repository"
	"github.com/google/uuid"
)

// ScheduleUseCase handles the business logic for creating new appointments.
type ScheduleUseCase struct {
	repo repository.AppointmentRepository
}

// NewScheduleUseCase creates a new ScheduleUseCase.
func NewScheduleUseCase(repo repository.AppointmentRepository) *ScheduleUseCase {
	return &ScheduleUseCase{repo: repo}
}

// ScheduleRequest contains the data needed to schedule a new appointment.
type ScheduleRequest struct {
	TenantID       string
	PatientID      string
	ProfessionalID string
	StartTime      time.Time
	EndTime        time.Time
}

// Execute schedules a new appointment after validating slot availability.
func (uc *ScheduleUseCase) Execute(ctx context.Context, req ScheduleRequest) (*entity.Appointment, error) {
	tenantUUID, err := uuid.Parse(req.TenantID)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid tenant ID", domain.ErrInvalidInput)
	}

	patientUUID, err := uuid.Parse(req.PatientID)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid patient ID", domain.ErrInvalidInput)
	}

	professionalUUID, err := uuid.Parse(req.ProfessionalID)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid professional ID", domain.ErrInvalidInput)
	}

	if req.StartTime.After(req.EndTime) || req.StartTime.Equal(req.EndTime) {
		return nil, fmt.Errorf("%w: start time must be before end time", domain.ErrInvalidInput)
	}

	// Check slot availability
	available, err := uc.repo.IsSlotAvailable(ctx, professionalUUID, req.StartTime, req.EndTime)
	if err != nil {
		return nil, fmt.Errorf("checking slot availability: %w", err)
	}
	if !available {
		return nil, domain.ErrSlotUnavailable
	}

	appt := &entity.Appointment{
		ID:             uuid.New(),
		TenantID:       tenantUUID,
		PatientID:      patientUUID,
		ProfessionalID: professionalUUID,
		StartTime:      req.StartTime,
		EndTime:        req.EndTime,
		Status:         entity.StatusBooked,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := uc.repo.Create(ctx, appt); err != nil {
		return nil, fmt.Errorf("creating appointment: %w", err)
	}

	return appt, nil
}
