package entity

import (
	"time"

	"github.com/google/uuid"
)

// AnatomicalView represents the viewing angle of the anatomical map.
type AnatomicalView string

const (
	ViewAnterior     AnatomicalView = "ANTERIOR"
	ViewPosterior    AnatomicalView = "POSTERIOR"
	ViewLateralLeft  AnatomicalView = "LATERAL_LEFT"
	ViewLateralRight AnatomicalView = "LATERAL_RIGHT"
	ViewJointDetail  AnatomicalView = "JOINT_DETAIL"
)

// AnatomicalLayer represents the depth layer of the anatomical visualization.
type AnatomicalLayer string

const (
	LayerCutaneous          AnatomicalLayer = "CUTANEOUS"
	LayerSuperficialMuscular AnatomicalLayer = "SUPERFICIAL_MUSCULAR"
	LayerDeepMuscular       AnatomicalLayer = "DEEP_MUSCULAR"
	LayerLigamentArticular  AnatomicalLayer = "LIGAMENT_ARTICULAR"
	LayerTriggerPoints      AnatomicalLayer = "TRIGGER_POINTS"
)

// PainType classifies the nature of the patient's pain.
type PainType string

const (
	PainNociceptiveAcute   PainType = "NOCICEPTIVE_ACUTE"
	PainNociceptiveChronic PainType = "NOCICEPTIVE_CHRONIC"
	PainNeuropathic        PainType = "NEUROPATHIC"
	PainReferred           PainType = "REFERRED"
	PainMechanical         PainType = "MECHANICAL"
)

// Coordinates represents a normalized 2D position on the anatomical canvas (0.0-1.0).
type Coordinates struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// PainPoint represents a single pain observation on the anatomical map.
type PainPoint struct {
	RegionID          string   `json:"regionId"`
	RegionName        string   `json:"regionName"`
	PainScoreEVA      int      `json:"painScoreEVA"` // 0-10 EVA scale
	PainType          PainType `json:"painType"`
	TriggerPoint      bool     `json:"triggerPoint"`
	MotionRestriction []string `json:"motionRestriction"`
	Coordinates       Coordinates `json:"coordinates"`
}

// AnatomicalObservation is the top-level FHIR-compliant payload for the pain map.
type AnatomicalObservation struct {
	View   AnatomicalView  `json:"view"`
	Layer  AnatomicalLayer `json:"layer"`
	Points []PainPoint     `json:"points"`
}

// PainObservation is the domain entity stored in the database, wrapping
// the anatomical observation with audit metadata.
type PainObservation struct {
	ID              uuid.UUID             `json:"id"`
	TenantID        uuid.UUID             `json:"tenant_id"`
	MedicalRecordID uuid.UUID             `json:"medical_record_id"`
	PatientID       uuid.UUID             `json:"patient_id"`
	ObservationData AnatomicalObservation `json:"observation_data"`
	CreatedAt       time.Time             `json:"created_at"`
}
