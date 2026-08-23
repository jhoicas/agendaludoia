// Package painmap contains the business logic for pain map observations.
package painmap

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

// SavePainObservationUseCase handles persisting anatomical pain observations.
type SavePainObservationUseCase struct {
	repo repository.PainMapRepository
}

// NewSavePainObservationUseCase creates the use case.
func NewSavePainObservationUseCase(repo repository.PainMapRepository) *SavePainObservationUseCase {
	return &SavePainObservationUseCase{repo: repo}
}

// SaveRequest contains the data for a pain observation submission.
type SaveRequest struct {
	TenantID        string
	MedicalRecordID string
	PatientID       string
	View            entity.AnatomicalView
	Layer           entity.AnatomicalLayer
	Points          []entity.PainPoint
}

// Execute validates and persists a pain observation.
func (uc *SavePainObservationUseCase) Execute(ctx context.Context, req SaveRequest) (*entity.PainObservation, error) {
	tenantUUID, err := uuid.Parse(req.TenantID)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid tenant ID", domain.ErrInvalidInput)
	}

	recordUUID, err := uuid.Parse(req.MedicalRecordID)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid medical record ID", domain.ErrInvalidInput)
	}

	patientUUID, err := uuid.Parse(req.PatientID)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid patient ID", domain.ErrInvalidInput)
	}

	// Validate all EVA scores
	for _, point := range req.Points {
		if _, err := valobj.NewEVAScore(point.PainScoreEVA); err != nil {
			return nil, err
		}

		// Validate coordinates are normalized (0.0 to 1.0)
		if point.Coordinates.X < 0 || point.Coordinates.X > 1 ||
			point.Coordinates.Y < 0 || point.Coordinates.Y > 1 {
			return nil, fmt.Errorf("%w: coordinates must be normalized between 0.0 and 1.0", domain.ErrInvalidInput)
		}
	}

	observation := &entity.PainObservation{
		ID:              uuid.New(),
		TenantID:        tenantUUID,
		MedicalRecordID: recordUUID,
		PatientID:       patientUUID,
		ObservationData: entity.AnatomicalObservation{
			View:   req.View,
			Layer:  req.Layer,
			Points: req.Points,
		},
		CreatedAt: time.Now(),
	}

	if err := uc.repo.Save(ctx, observation); err != nil {
		return nil, fmt.Errorf("saving pain observation: %w", err)
	}

	return observation, nil
}
