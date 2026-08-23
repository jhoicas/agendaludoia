// Package grpc contains the gRPC handler implementations for AgendaLudoia.
package grpc

import (
	"context"

	"go.uber.org/zap"
)

// AppointmentHandler implements the gRPC AppointmentService.
// It delegates business logic to the use case layer.
type AppointmentHandler struct {
	// TODO: Embed generated UnimplementedAppointmentServiceServer
	logger *zap.Logger
}

// NewAppointmentHandler creates a new AppointmentHandler.
func NewAppointmentHandler(logger *zap.Logger) *AppointmentHandler {
	return &AppointmentHandler{
		logger: logger,
	}
}

// ScheduleAppointment handles incoming appointment scheduling requests.
func (h *AppointmentHandler) ScheduleAppointment(ctx context.Context) error {
	// TODO: Implement after proto generation
	// 1. Extract RLS claims from context
	// 2. Validate request
	// 3. Delegate to ScheduleUseCase
	return nil
}

// CancelAppointment handles appointment cancellation requests.
func (h *AppointmentHandler) CancelAppointment(ctx context.Context) error {
	// TODO: Implement after proto generation
	// 1. Extract RLS claims from context
	// 2. Delegate to CancelUseCase
	// 3. If ErrCancellationWindowExpired, return codes.FailedPrecondition
	return nil
}
