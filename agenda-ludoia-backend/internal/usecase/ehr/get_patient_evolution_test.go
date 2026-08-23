package ehr

import (
	"context"
	"testing"
	"time"

	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockPainMapRepository struct {
	mock.Mock
}

func (m *MockPainMapRepository) Save(ctx context.Context, obs *entity.PainObservation) error {
	args := m.Called(ctx, obs)
	return args.Error(0)
}

func (m *MockPainMapRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockPainMapRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.PainObservation, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.PainObservation), args.Error(1)
}

func (m *MockPainMapRepository) ListByPatient(ctx context.Context, patientID uuid.UUID) ([]*entity.PainObservation, error) {
	args := m.Called(ctx, patientID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.PainObservation), args.Error(1)
}

func (m *MockPainMapRepository) ListByMedicalRecord(ctx context.Context, recordID uuid.UUID) ([]*entity.PainObservation, error) {
	args := m.Called(ctx, recordID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.PainObservation), args.Error(1)
}

func TestGetPatientEvolution_ValidRequest_ReturnsChronologicalMetrics(t *testing.T) {
	mockRepo := new(MockPainMapRepository)
	useCase := NewGetPatientEvolutionUseCase(mockRepo)

	patientID := uuid.New()
	mockRepo.On("ListByPatient", mock.Anything, patientID).Return([]*entity.PainObservation{
		{
			ID:        uuid.New(),
			PatientID: patientID,
			CreatedAt: time.Now().AddDate(0, 0, -10),
			ObservationData: entity.AnatomicalObservation{
				Points: []entity.PainPoint{
					{RegionID: "KNEE_R_ACL", PainScoreEVA: 7},
				},
			},
		},
	}, nil)

	req := GetEvolutionRequest{
		PatientID: patientID.String(),
		RegionID:  "KNEE_R_ACL",
	}

	report, err := useCase.Execute(context.Background(), req)

	assert.NoError(t, err)
	assert.NotNil(t, report)
	assert.Equal(t, patientID, report.PatientID)
	assert.NotEmpty(t, report.Metrics)
	mockRepo.AssertCalled(t, "ListByPatient", mock.Anything, patientID)
}
