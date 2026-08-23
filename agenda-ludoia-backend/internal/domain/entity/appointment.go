package entity

import (
	"time"

	"github.com/google/uuid"
)

// AppointmentStatus represents the lifecycle state of an appointment.
type AppointmentStatus string

const (
	StatusBooked    AppointmentStatus = "booked"
	StatusConfirmed AppointmentStatus = "confirmed"
	StatusCancelled AppointmentStatus = "cancelled"
	StatusNoShow    AppointmentStatus = "no_show"
	StatusCompleted AppointmentStatus = "completed"
)

// Appointment represents a scheduled clinical session between a professional and a patient.
// The 24-hour cancellation rule is enforced in the use case layer, not here.
type Appointment struct {
	ID                 uuid.UUID         `json:"id"`
	TenantID           uuid.UUID         `json:"tenant_id"`
	PatientID          uuid.UUID         `json:"patient_id"`
	ProfessionalID     uuid.UUID         `json:"professional_id"`
	StartTime          time.Time         `json:"start_time"`
	EndTime            time.Time         `json:"end_time"`
	Status             AppointmentStatus `json:"status"`
	CancellationReason string            `json:"cancellation_reason,omitempty"`
	CreatedAt          time.Time         `json:"created_at"`
	UpdatedAt          time.Time         `json:"updated_at"`
}

// Duration returns the appointment length.
func (a *Appointment) Duration() time.Duration {
	return a.EndTime.Sub(a.StartTime)
}

// IsCancellable returns true if the appointment hasn't already been cancelled or completed.
func (a *Appointment) IsCancellable() bool {
	return a.Status == StatusBooked || a.Status == StatusConfirmed
}

// IsModifiable returns true if the appointment can be rescheduled.
func (a *Appointment) IsModifiable() bool {
	return a.Status == StatusBooked || a.Status == StatusConfirmed
}
