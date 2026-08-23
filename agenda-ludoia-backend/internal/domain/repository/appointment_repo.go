package repository

import (
	"context"
	"time"

	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
)

// AppointmentReader provides read operations for appointments.
type AppointmentReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Appointment, error)
	ListByPatient(ctx context.Context, patientID uuid.UUID, from, to time.Time) ([]*entity.Appointment, error)
	ListByProfessional(ctx context.Context, professionalID uuid.UUID, from, to time.Time) ([]*entity.Appointment, error)
}

// AppointmentWriter provides write operations for appointments.
type AppointmentWriter interface {
	Create(ctx context.Context, appointment *entity.Appointment) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status entity.AppointmentStatus, reason string) error
}

// SlotChecker provides availability checking for appointment scheduling.
type SlotChecker interface {
	IsSlotAvailable(ctx context.Context, professionalID uuid.UUID, start, end time.Time) (bool, error)
}

// AppointmentRepository combines all appointment data operations.
type AppointmentRepository interface {
	AppointmentReader
	AppointmentWriter
	SlotChecker
}
