package repository

import (
	"context"

	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
)

// PainMapReader provides read operations for pain observations.
type PainMapReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.PainObservation, error)
	ListByPatient(ctx context.Context, patientID uuid.UUID) ([]*entity.PainObservation, error)
	ListByMedicalRecord(ctx context.Context, recordID uuid.UUID) ([]*entity.PainObservation, error)
}

// PainMapWriter provides write operations for pain observations.
type PainMapWriter interface {
	Save(ctx context.Context, observation *entity.PainObservation) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// PainMapRepository combines all pain map data operations.
type PainMapRepository interface {
	PainMapReader
	PainMapWriter
}
