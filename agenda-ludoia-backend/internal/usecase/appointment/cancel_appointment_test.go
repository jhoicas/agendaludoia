package appointment

import (
	"context"
	"testing"
	"time"

	"github.com/agendaLudoia/backend/internal/domain"
	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// ─── Mock Repository ────────────────────────────────────────────────────────

type MockAppointmentRepository struct {
	mock.Mock
}

func (m *MockAppointmentRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Appointment, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Appointment), args.Error(1)
}

func (m *MockAppointmentRepository) ListByPatient(ctx context.Context, patientID uuid.UUID, from, to time.Time) ([]*entity.Appointment, error) {
	args := m.Called(ctx, patientID, from, to)
	return args.Get(0).([]*entity.Appointment), args.Error(1)
}

func (m *MockAppointmentRepository) ListByProfessional(ctx context.Context, professionalID uuid.UUID, from, to time.Time) ([]*entity.Appointment, error) {
	args := m.Called(ctx, professionalID, from, to)
	return args.Get(0).([]*entity.Appointment), args.Error(1)
}

func (m *MockAppointmentRepository) Create(ctx context.Context, appointment *entity.Appointment) error {
	args := m.Called(ctx, appointment)
	return args.Error(0)
}

func (m *MockAppointmentRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status entity.AppointmentStatus, reason string) error {
	args := m.Called(ctx, id, status, reason)
	return args.Error(0)
}

func (m *MockAppointmentRepository) IsSlotAvailable(ctx context.Context, professionalID uuid.UUID, start, end time.Time) (bool, error) {
	args := m.Called(ctx, professionalID, start, end)
	return args.Bool(0), args.Error(1)
}

// ─── TDD Test Suite: 24-Hour Cancellation Rule ──────────────────────────────

var (
	testTenantID = uuid.New()
	testApptID   = uuid.New()
)

func TestCancelAppointment_LessThan24Hours_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(12 * time.Hour) // Appointment in 12 hours (< 24h)

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  testTenantID,
		StartTime: apptTime,
		Status:    entity.StatusBooked,
	}, nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.Error(t, err)
	assert.ErrorIs(t, err, domain.ErrCancellationWindowExpired)
	mockRepo.AssertNotCalled(t, "UpdateStatus", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestCancelAppointment_Exactly24Hours_Succeeds(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(24 * time.Hour) // Exactly 24 hours away

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  testTenantID,
		StartTime: apptTime,
		Status:    entity.StatusBooked,
	}, nil)
	mockRepo.On("UpdateStatus", mock.Anything, testApptID, entity.StatusCancelled, "patient_cancelled").Return(nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.NoError(t, err)
	mockRepo.AssertCalled(t, "UpdateStatus", mock.Anything, testApptID, entity.StatusCancelled, "patient_cancelled")
}

func TestCancelAppointment_MoreThan24Hours_Succeeds(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(72 * time.Hour) // 3 days away

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  testTenantID,
		StartTime: apptTime,
		Status:    entity.StatusConfirmed,
	}, nil)
	mockRepo.On("UpdateStatus", mock.Anything, testApptID, entity.StatusCancelled, "patient_cancelled").Return(nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.NoError(t, err)
	mockRepo.AssertCalled(t, "UpdateStatus", mock.Anything, testApptID, entity.StatusCancelled, "patient_cancelled")
}

func TestCancelAppointment_AlreadyCancelled_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(48 * time.Hour)

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  testTenantID,
		StartTime: apptTime,
		Status:    entity.StatusCancelled, // Already cancelled
	}, nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.Error(t, err)
	assert.ErrorIs(t, err, domain.ErrAppointmentNotCancellable)
	mockRepo.AssertNotCalled(t, "UpdateStatus", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestCancelAppointment_CompletedAppointment_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(48 * time.Hour)

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  testTenantID,
		StartTime: apptTime,
		Status:    entity.StatusCompleted,
	}, nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.Error(t, err)
	assert.ErrorIs(t, err, domain.ErrAppointmentNotCancellable)
}

func TestCancelAppointment_TenantMismatch_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(48 * time.Hour)
	otherTenantID := uuid.New() // Different tenant

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  otherTenantID, // Belongs to a different tenant
		StartTime: apptTime,
		Status:    entity.StatusBooked,
	}, nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.Error(t, err)
	assert.ErrorIs(t, err, domain.ErrTenantMismatch)
}

func TestCancelAppointment_NotFound_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(nil, nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.Error(t, err)
	assert.ErrorIs(t, err, domain.ErrAppointmentNotFound)
}

func TestCancelAppointment_23Hours59Minutes_ReturnsError(t *testing.T) {
	// ARRANGE — Edge case: 1 minute before the 24h threshold
	mockRepo := new(MockAppointmentRepository)
	useCase := NewCancelUseCase(mockRepo)

	now := time.Now()
	apptTime := now.Add(23*time.Hour + 59*time.Minute)

	mockRepo.On("GetByID", mock.Anything, testApptID).Return(&entity.Appointment{
		ID:        testApptID,
		TenantID:  testTenantID,
		StartTime: apptTime,
		Status:    entity.StatusBooked,
	}, nil)

	// ACT
	err := useCase.Execute(context.Background(), testTenantID.String(), testApptID.String(), now)

	// ASSERT
	assert.Error(t, err)
	assert.ErrorIs(t, err, domain.ErrCancellationWindowExpired)
}
