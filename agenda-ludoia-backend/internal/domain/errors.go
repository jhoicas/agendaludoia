// Package domain contains domain-level error definitions for AgendaLudoia.
// These errors are used across the domain layer and provide semantic meaning
// for business rule violations.
package domain

import "errors"

var (
	// ErrCancellationWindowExpired is returned when a patient attempts to cancel
	// or reschedule an appointment within the 24-hour blackout window.
	ErrCancellationWindowExpired = errors.New("cancellation window expired: modification blocked within 24h of appointment")

	// ErrTenantMismatch is returned when an operation crosses tenant boundaries.
	ErrTenantMismatch = errors.New("tenant mismatch: cross-tenant access denied")

	// ErrInvalidEVAScore is returned when a pain score is outside the 0-10 range.
	ErrInvalidEVAScore = errors.New("invalid EVA score: must be between 0 and 10")

	// ErrSlotUnavailable is returned when the requested time slot is already booked.
	ErrSlotUnavailable = errors.New("slot unavailable: the requested time is already occupied")

	// ErrAppointmentNotFound is returned when the appointment ID doesn't exist.
	ErrAppointmentNotFound = errors.New("appointment not found")

	// ErrAppointmentNotCancellable is returned when the appointment status doesn't allow cancellation.
	ErrAppointmentNotCancellable = errors.New("appointment cannot be cancelled in its current status")

	// ErrUnauthorized is returned for insufficient permissions.
	ErrUnauthorized = errors.New("unauthorized: insufficient permissions for this operation")

	// ErrInvalidInput is returned for malformed or incomplete request data.
	ErrInvalidInput = errors.New("invalid input data")
)
