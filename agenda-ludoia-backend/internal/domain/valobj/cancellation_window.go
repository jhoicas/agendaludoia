package valobj

import (
	"fmt"
	"time"

	"github.com/agendaLudoia/backend/internal/domain"
)

const (
	// DefaultCancellationWindowHours is the inviolable 24-hour business rule.
	DefaultCancellationWindowHours = 24
)

// CancellationWindow encapsulates the business rule that determines whether
// an appointment can be freely cancelled/rescheduled by the patient.
//
// Rule:
//   - If Δt = (appointment_time - action_time) >= 24h → Free cancellation/reschedule
//   - If Δt < 24h → Blocked for public portal; admin notification for manual handling
type CancellationWindow struct {
	windowHours int
}

// NewCancellationWindow creates a CancellationWindow with the specified hours.
// Use DefaultCancellationWindowHours (24) unless the tenant has a custom setting.
func NewCancellationWindow(hours int) CancellationWindow {
	if hours <= 0 {
		hours = DefaultCancellationWindowHours
	}
	return CancellationWindow{windowHours: hours}
}

// CanCancel evaluates whether a cancellation/reschedule is permitted.
// appointmentTime: the scheduled start time of the appointment.
// actionTime: the current time when the user attempts the action.
func (cw CancellationWindow) CanCancel(appointmentTime, actionTime time.Time) error {
	delta := appointmentTime.Sub(actionTime)
	threshold := time.Duration(cw.windowHours) * time.Hour

	if delta < threshold {
		return fmt.Errorf("%w: appointment in %v, requires at least %dh notice",
			domain.ErrCancellationWindowExpired, delta.Round(time.Minute), cw.windowHours)
	}
	return nil
}

// RemainingTime returns the time remaining until the appointment.
func (cw CancellationWindow) RemainingTime(appointmentTime, now time.Time) time.Duration {
	return appointmentTime.Sub(now)
}

// IsWithinWindow returns true if the current time is within the cancellation blackout window.
func (cw CancellationWindow) IsWithinWindow(appointmentTime, now time.Time) bool {
	return cw.CanCancel(appointmentTime, now) != nil
}
