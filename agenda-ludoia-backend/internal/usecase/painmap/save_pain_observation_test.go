package painmap

import (
	"context"
	"testing"

	"github.com/agendaLudoia/backend/internal/domain"
	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// ─── Mock Repository ────────────────────────────────────────────────────────

type MockPainMapRepository struct {
	mock.Mock
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
	return args.Get(0).([]*entity.PainObservation), args.Error(1)
}

func (m *MockPainMapRepository) ListByMedicalRecord(ctx context.Context, recordID uuid.UUID) ([]*entity.PainObservation, error) {
	args := m.Called(ctx, recordID)
	return args.Get(0).([]*entity.PainObservation), args.Error(1)
}

func (m *MockPainMapRepository) Save(ctx context.Context, observation *entity.PainObservation) error {
	args := m.Called(ctx, observation)
	return args.Error(0)
}

func (m *MockPainMapRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// ─── TDD Test Suite: Pain Observation ───────────────────────────────────────

var (
	testTenantID  = uuid.New()
	testPatientID = uuid.New()
	testRecordID  = uuid.New()
)

func TestSavePainObservation_ValidACLPoint_Succeeds(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockPainMapRepository)
	useCase := NewSavePainObservationUseCase(mockRepo)

	mockRepo.On("Save", mock.Anything, mock.AnythingOfType("*entity.PainObservation")).Return(nil)

	req := SaveRequest{
		TenantID:        testTenantID.String(),
		MedicalRecordID: testRecordID.String(),
		PatientID:       testPatientID.String(),
		View:            entity.ViewAnterior,
		Layer:           entity.LayerLigamentArticular,
		Points: []entity.PainPoint{
			{
				RegionID:          "KNEE_R_ACL",
				RegionName:        "Ligamento Cruzado Anterior - Rodilla Derecha",
				PainScoreEVA:      7,
				PainType:          entity.PainNociceptiveAcute,
				TriggerPoint:      false,
				MotionRestriction: []string{"FLEXION_LIMITED_90_DEG"},
				Coordinates:       entity.Coordinates{X: 0.54, Y: 0.72},
			},
		},
	}

	// ACT
	result, err := useCase.Execute(context.Background(), req)

	// ASSERT
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, entity.ViewAnterior, result.ObservationData.View)
	assert.Equal(t, entity.LayerLigamentArticular, result.ObservationData.Layer)
	assert.Len(t, result.ObservationData.Points, 1)
	assert.Equal(t, "KNEE_R_ACL", result.ObservationData.Points[0].RegionID)
	assert.Equal(t, 7, result.ObservationData.Points[0].PainScoreEVA)
	mockRepo.AssertCalled(t, "Save", mock.Anything, mock.AnythingOfType("*entity.PainObservation"))
}

func TestSavePainObservation_InvalidEVAScore_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockPainMapRepository)
	useCase := NewSavePainObservationUseCase(mockRepo)

	req := SaveRequest{
		TenantID:        testTenantID.String(),
		MedicalRecordID: testRecordID.String(),
		PatientID:       testPatientID.String(),
		View:            entity.ViewAnterior,
		Layer:           entity.LayerDeepMuscular,
		Points: []entity.PainPoint{
			{
				RegionID:     "SHOULDER_R_SUPRASPINATUS",
				RegionName:   "Supraespinoso - Hombro Derecho",
				PainScoreEVA: 15, // Invalid: exceeds 10
				PainType:     entity.PainMechanical,
				Coordinates:  entity.Coordinates{X: 0.3, Y: 0.25},
			},
		},
	}

	// ACT
	result, err := useCase.Execute(context.Background(), req)

	// ASSERT
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domain.ErrInvalidEVAScore)
	mockRepo.AssertNotCalled(t, "Save", mock.Anything, mock.Anything)
}

func TestSavePainObservation_InvalidCoordinates_ReturnsError(t *testing.T) {
	// ARRANGE
	mockRepo := new(MockPainMapRepository)
	useCase := NewSavePainObservationUseCase(mockRepo)

	req := SaveRequest{
		TenantID:        testTenantID.String(),
		MedicalRecordID: testRecordID.String(),
		PatientID:       testPatientID.String(),
		View:            entity.ViewPosterior,
		Layer:           entity.LayerSuperficialMuscular,
		Points: []entity.PainPoint{
			{
				RegionID:     "BACK_TRAPEZIUS_UPPER",
				RegionName:   "Trapecio Superior",
				PainScoreEVA: 5,
				PainType:     entity.PainNociceptiveChronic,
				Coordinates:  entity.Coordinates{X: 1.5, Y: 0.2}, // Invalid: X > 1.0
			},
		},
	}

	// ACT
	result, err := useCase.Execute(context.Background(), req)

	// ASSERT
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.ErrorIs(t, err, domain.ErrInvalidInput)
}

func TestSavePainObservation_MultipleRegions_Succeeds(t *testing.T) {
	// ARRANGE — Multiple anatomical regions in a single observation
	mockRepo := new(MockPainMapRepository)
	useCase := NewSavePainObservationUseCase(mockRepo)

	mockRepo.On("Save", mock.Anything, mock.AnythingOfType("*entity.PainObservation")).Return(nil)

	req := SaveRequest{
		TenantID:        testTenantID.String(),
		MedicalRecordID: testRecordID.String(),
		PatientID:       testPatientID.String(),
		View:            entity.ViewPosterior,
		Layer:           entity.LayerDeepMuscular,
		Points: []entity.PainPoint{
			{
				RegionID:     "BACK_TRAPEZIUS_UPPER",
				RegionName:   "Trapecio Superior",
				PainScoreEVA: 6,
				PainType:     entity.PainNociceptiveChronic,
				TriggerPoint: true,
				Coordinates:  entity.Coordinates{X: 0.45, Y: 0.18},
			},
			{
				RegionID:          "BACK_ERECTOR_SPINAE_L4",
				RegionName:        "Erectores de la Columna L4",
				PainScoreEVA:      8,
				PainType:          entity.PainMechanical,
				MotionRestriction: []string{"FLEXION_LIMITED", "ROTATION_LIMITED"},
				Coordinates:       entity.Coordinates{X: 0.50, Y: 0.55},
			},
			{
				RegionID:     "LEG_R_ACHILLES_TENDON",
				RegionName:   "Tendón de Aquiles - Derecho",
				PainScoreEVA: 4,
				PainType:     entity.PainNociceptiveAcute,
				Coordinates:  entity.Coordinates{X: 0.55, Y: 0.92},
			},
		},
	}

	// ACT
	result, err := useCase.Execute(context.Background(), req)

	// ASSERT
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Len(t, result.ObservationData.Points, 3)
}

func TestSavePainObservation_TriggerPointLayer_Succeeds(t *testing.T) {
	// ARRANGE — Trigger point specific layer
	mockRepo := new(MockPainMapRepository)
	useCase := NewSavePainObservationUseCase(mockRepo)

	mockRepo.On("Save", mock.Anything, mock.AnythingOfType("*entity.PainObservation")).Return(nil)

	req := SaveRequest{
		TenantID:        testTenantID.String(),
		MedicalRecordID: testRecordID.String(),
		PatientID:       testPatientID.String(),
		View:            entity.ViewLateralRight,
		Layer:           entity.LayerTriggerPoints,
		Points: []entity.PainPoint{
			{
				RegionID:     "NECK_SCM_R",
				RegionName:   "Esternocleidomastoideo - Derecho",
				PainScoreEVA: 5,
				PainType:     entity.PainReferred,
				TriggerPoint: true,
				Coordinates:  entity.Coordinates{X: 0.60, Y: 0.08},
			},
		},
	}

	// ACT
	result, err := useCase.Execute(context.Background(), req)

	// ASSERT
	assert.NoError(t, err)
	assert.Equal(t, entity.LayerTriggerPoints, result.ObservationData.Layer)
	assert.True(t, result.ObservationData.Points[0].TriggerPoint)
}
