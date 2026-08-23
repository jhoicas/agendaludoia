package entity

import (
	"time"

	"github.com/google/uuid"
)

// PatientEvolutionMetric representa una muestra cronológica del estado del paciente.
type PatientEvolutionMetric struct {
	SessionDate   time.Time `json:"session_date"`
	PainScoreEVA  int       `json:"pain_score_eva"`
	ROMDegrees    float64   `json:"rom_degrees"`
	DanielsMuscle float64   `json:"daniels_muscle"`
}

// PatientEvolutionReport agrupa el historial longitudinal para una región anatómica.
type PatientEvolutionReport struct {
	PatientID  uuid.UUID                `json:"patient_id"`
	RegionID   string                   `json:"region_id"`
	RegionName string                   `json:"region_name"`
	Metrics    []PatientEvolutionMetric `json:"metrics"`
}
