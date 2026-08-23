package supabase

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/agendaLudoia/backend/internal/domain/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PainMapSQL implements repository.PainMapRepository using Supabase PostgreSQL.
// The observation_data field is stored as JSONB for FHIR-compliant flexibility.
type PainMapSQL struct {
	pool *pgxpool.Pool
}

// NewPainMapSQL creates a new PainMapSQL repository.
func NewPainMapSQL(pool *pgxpool.Pool) *PainMapSQL {
	return &PainMapSQL{pool: pool}
}

// Save persists a pain observation with its anatomical data as JSONB.
func (r *PainMapSQL) Save(ctx context.Context, obs *entity.PainObservation) error {
	observationJSON, err := json.Marshal(obs.ObservationData)
	if err != nil {
		return fmt.Errorf("marshaling observation data: %w", err)
	}

	query := `
		INSERT INTO pain_observations (id, tenant_id, medical_record_id, patient_id, observation_data, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err = r.pool.Exec(ctx, query,
		obs.ID, obs.TenantID, obs.MedicalRecordID, obs.PatientID,
		observationJSON, obs.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("inserting pain observation: %w", err)
	}

	return nil
}

// GetByID retrieves a pain observation by ID.
func (r *PainMapSQL) GetByID(ctx context.Context, id uuid.UUID) (*entity.PainObservation, error) {
	query := `
		SELECT id, tenant_id, medical_record_id, patient_id, observation_data, created_at
		FROM pain_observations
		WHERE id = $1
	`

	var obs entity.PainObservation
	var observationJSON []byte

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&obs.ID, &obs.TenantID, &obs.MedicalRecordID, &obs.PatientID,
		&observationJSON, &obs.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("querying pain observation %s: %w", id, err)
	}

	if err := json.Unmarshal(observationJSON, &obs.ObservationData); err != nil {
		return nil, fmt.Errorf("unmarshaling observation data: %w", err)
	}

	return &obs, nil
}

// TODO: Implement ListByPatient, ListByMedicalRecord, Delete
