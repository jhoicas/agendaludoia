package entity

import (
	"time"

	"github.com/google/uuid"
)

// MedicalRecord represents a single clinical encounter or evaluation session.
// It stores structured biomechanical metrics for longitudinal comparison
// across 50-60 annual evaluations per patient.
type MedicalRecord struct {
	ID               uuid.UUID       `json:"id"`
	TenantID         uuid.UUID       `json:"tenant_id"`
	PatientID        uuid.UUID       `json:"patient_id"`
	ProfessionalID   uuid.UUID       `json:"professional_id"`
	AppointmentID    *uuid.UUID      `json:"appointment_id,omitempty"`
	ChiefComplaint   string          `json:"chief_complaint"`
	ROMData          ROMData         `json:"rom_data"`
	MuscleStrength   MuscleStrength  `json:"muscle_strength"`
	BodyComposition  BodyComposition `json:"body_composition"`
	FunctionalTests  []FunctionalTest `json:"functional_tests"`
	Alerts           []MedicalAlert  `json:"alerts"`
	Notes            string          `json:"notes"`
	CreatedAt        time.Time       `json:"created_at"`
}

// ROMData stores Range of Motion measurements in degrees for various joints.
type ROMData struct {
	Measurements []ROMMeasurement `json:"measurements"`
}

// ROMMeasurement is a single ROM measurement.
type ROMMeasurement struct {
	Joint     string  `json:"joint"`
	Movement  string  `json:"movement"`
	Side      string  `json:"side"` // "left", "right", "bilateral"
	Degrees   float64 `json:"degrees"`
	IsNormal  bool    `json:"is_normal"`
}

// MuscleStrength stores muscle strength assessments using the Daniels scale (0-5).
type MuscleStrength struct {
	Assessments []StrengthAssessment `json:"assessments"`
}

// StrengthAssessment is a single muscle strength measurement.
type StrengthAssessment struct {
	MuscleGroup string  `json:"muscle_group"`
	Side        string  `json:"side"`
	Grade       float64 `json:"grade"` // Daniels scale 0-5 (allows half grades like 3.5)
}

// BodyComposition stores body mass metrics.
type BodyComposition struct {
	MuscleMassPercent float64 `json:"muscle_mass_percent"`
	FatMassPercent    float64 `json:"fat_mass_percent"`
	WeightKg          float64 `json:"weight_kg"`
	HeightCm          float64 `json:"height_cm"`
	BMI               float64 `json:"bmi"`
}

// FunctionalTest represents a specific functional assessment.
type FunctionalTest struct {
	TestName    string  `json:"test_name"`
	Score       float64 `json:"score"`
	Unit        string  `json:"unit"`
	IsNormal    bool    `json:"is_normal"`
	Notes       string  `json:"notes,omitempty"`
}

// MedicalAlert represents a persistent warning banner for clinical sessions.
// Example: "Antecedente: Reconstrucción de LCA en rodilla derecha con injerto HTH"
type MedicalAlert struct {
	ID          string `json:"id"`
	Category    string `json:"category"` // "surgical_history", "allergy", "contraindication"
	Severity    string `json:"severity"` // "info", "warning", "critical"
	Message     string `json:"message"`
	IsActive    bool   `json:"is_active"`
}
