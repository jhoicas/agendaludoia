/**
 * TypeScript type definitions for the AgendaLudoia Pain Map module.
 * These types mirror the FHIR-compliant JSONB payload structure stored
 * in Supabase and the Protobuf definitions in painmap.proto.
 */

// ─── Anatomical View ────────────────────────────────────────────────────────

export type AnatomicalView =
  | 'ANTERIOR'
  | 'POSTERIOR'
  | 'LATERAL_LEFT'
  | 'LATERAL_RIGHT'
  | 'JOINT_DETAIL';

// ─── Anatomical Layer ───────────────────────────────────────────────────────

export type AnatomicalLayer =
  | 'CUTANEOUS'
  | 'SUPERFICIAL_MUSCULAR'
  | 'DEEP_MUSCULAR'
  | 'LIGAMENT_ARTICULAR'
  | 'TRIGGER_POINTS';

// ─── Pain Type ──────────────────────────────────────────────────────────────

export type PainType =
  | 'NOCICEPTIVE_ACUTE'
  | 'NOCICEPTIVE_CHRONIC'
  | 'NEUROPATHIC'
  | 'REFERRED'
  | 'MECHANICAL';

// ─── Body Region Category ───────────────────────────────────────────────────

export type BodyRegionCategory =
  | 'HEAD_NECK'
  | 'SHOULDER_UPPER_LIMB'
  | 'TRUNK_SPINE'
  | 'HIP_LOWER_LIMB';

// ─── Coordinates ────────────────────────────────────────────────────────────

/** Normalized 2D position on the anatomical canvas (0.0 - 1.0) */
export interface Coordinates {
  x: number;
  y: number;
}

// ─── Pain Point ─────────────────────────────────────────────────────────────

/** A single pain observation point on the anatomical map */
export interface PainPoint {
  /** Unique region identifier, e.g., "KNEE_R_ACL" */
  regionId: string;
  /** Human-readable name, e.g., "Ligamento Cruzado Anterior - Rodilla Derecha" */
  regionName: string;
  /** EVA pain intensity score (0-10) */
  painScoreEVA: number;
  /** Classification of pain type */
  painType: PainType;
  /** Whether this is a myofascial trigger point */
  triggerPoint: boolean;
  /** List of motion restrictions */
  motionRestriction: string[];
  /** Position on the canvas (normalized) */
  coordinates: Coordinates;
}

// ─── Anatomical Observation ─────────────────────────────────────────────────

/** The top-level FHIR-compliant payload for pain map observations */
export interface AnatomicalObservation {
  view: AnatomicalView;
  layer: AnatomicalLayer;
  points: PainPoint[];
}

// ─── Pain Observation (Full Entity) ─────────────────────────────────────────

/** Complete pain observation entity with metadata */
export interface PainObservation {
  id: string;
  tenantId: string;
  medicalRecordId: string;
  patientId: string;
  observationData: AnatomicalObservation;
  createdAt: string; // ISO 8601
}

// ─── Predefined Anatomical Region ───────────────────────────────────────────

/** Pre-defined anatomical region for the UI region picker */
export interface AnatomicalRegion {
  regionId: string;
  regionName: string;
  category: BodyRegionCategory;
  defaultView: AnatomicalView;
  defaultLayer: AnatomicalLayer;
  defaultCoordinates: Coordinates;
}

// ─── Canvas Engine State ────────────────────────────────────────────────────

/** State managed by the usePainCanvasEngine hook */
export interface PainCanvasState {
  currentView: AnatomicalView;
  currentLayer: AnatomicalLayer;
  selectedPoints: PainPoint[];
  isDrawing: boolean;
  activeRegionId: string | null;
}

// ─── Region Selection Input ─────────────────────────────────────────────────

/** Input for selecting a region on the canvas */
export interface RegionSelectionInput {
  regionId: string;
  regionName: string;
  coordinates: Coordinates;
}

// ─── Predefined Anatomical Regions Catalog ──────────────────────────────────
// Covers the full musculoskeletal system specified in the requirements.

export const ANATOMICAL_REGIONS: AnatomicalRegion[] = [
  // ── Head & Neck ─────────────────────────────────────────────────────
  { regionId: 'NECK_TRAPEZIUS_UPPER', regionName: 'Trapecio Superior', category: 'HEAD_NECK', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.45, y: 0.12 } },
  { regionId: 'NECK_SCM_R', regionName: 'Esternocleidomastoideo - Derecho', category: 'HEAD_NECK', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.55, y: 0.08 } },
  { regionId: 'NECK_SCM_L', regionName: 'Esternocleidomastoideo - Izquierdo', category: 'HEAD_NECK', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.45, y: 0.08 } },
  { regionId: 'NECK_SPLENIUS', regionName: 'Esplenio de la Cabeza', category: 'HEAD_NECK', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.50, y: 0.07 } },
  { regionId: 'NECK_SCALENES', regionName: 'Escálenos', category: 'HEAD_NECK', defaultView: 'LATERAL_RIGHT', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.50, y: 0.09 } },
  { regionId: 'NECK_SUBOCCIPITALS', regionName: 'Suboccipitales', category: 'HEAD_NECK', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.50, y: 0.05 } },

  // ── Shoulder & Upper Limb ───────────────────────────────────────────
  { regionId: 'SHOULDER_R_DELTOID_ANT', regionName: 'Deltoides Anterior - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.72, y: 0.20 } },
  { regionId: 'SHOULDER_R_DELTOID_MID', regionName: 'Deltoides Medio - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'LATERAL_RIGHT', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.50, y: 0.20 } },
  { regionId: 'SHOULDER_R_DELTOID_POST', regionName: 'Deltoides Posterior - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.30, y: 0.20 } },
  { regionId: 'SHOULDER_R_SUPRASPINATUS', regionName: 'Supraespinoso - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.32, y: 0.16 } },
  { regionId: 'SHOULDER_R_INFRASPINATUS', regionName: 'Infraespinoso - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.30, y: 0.22 } },
  { regionId: 'SHOULDER_R_SUBSCAPULARIS', regionName: 'Subescapular - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.70, y: 0.22 } },
  { regionId: 'SHOULDER_R_TERES_MINOR', regionName: 'Redondo Menor - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.28, y: 0.24 } },
  { regionId: 'ARM_R_BICEPS_LONG', regionName: 'Bíceps Cabeza Larga - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.75, y: 0.30 } },
  { regionId: 'ARM_R_BICEPS_SHORT', regionName: 'Bíceps Cabeza Corta - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.73, y: 0.30 } },
  { regionId: 'ARM_R_BRACHIALIS', regionName: 'Braquial - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.76, y: 0.33 } },
  { regionId: 'ARM_R_TRICEPS', regionName: 'Tríceps - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.25, y: 0.32 } },
  { regionId: 'ELBOW_R_LATERAL_EPICONDYLE', regionName: 'Epicóndilo Lateral - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'LATERAL_RIGHT', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.36 } },
  { regionId: 'ELBOW_R_MEDIAL_EPICONDYLE', regionName: 'Epicóndilo Medial - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.72, y: 0.36 } },
  { regionId: 'WRIST_R_FLEXORS', regionName: 'Flexores de Muñeca - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.78, y: 0.40 } },
  { regionId: 'WRIST_R_EXTENSORS', regionName: 'Extensores de Muñeca - Derecho', category: 'SHOULDER_UPPER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.22, y: 0.40 } },

  // ── Trunk & Spine ───────────────────────────────────────────────────
  { regionId: 'CHEST_PECTORAL_MAJOR_R', regionName: 'Pectoral Mayor - Derecho', category: 'TRUNK_SPINE', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.62, y: 0.22 } },
  { regionId: 'CHEST_PECTORAL_MINOR_R', regionName: 'Pectoral Menor - Derecho', category: 'TRUNK_SPINE', defaultView: 'ANTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.62, y: 0.24 } },
  { regionId: 'ABDOMEN_RECTUS', regionName: 'Recto Abdominal', category: 'TRUNK_SPINE', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.50, y: 0.38 } },
  { regionId: 'ABDOMEN_OBLIQUES', regionName: 'Oblicuos', category: 'TRUNK_SPINE', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.58, y: 0.36 } },
  { regionId: 'BACK_LATISSIMUS', regionName: 'Dorsal Ancho', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.38, y: 0.32 } },
  { regionId: 'BACK_RHOMBOIDS', regionName: 'Romboides', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.42, y: 0.22 } },
  { regionId: 'BACK_ERECTOR_SPINAE', regionName: 'Erectores de la Columna', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.48, y: 0.35 } },
  { regionId: 'SPINE_LUMBAR_L1', regionName: 'Zona Lumbar L1', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.40 } },
  { regionId: 'SPINE_LUMBAR_L2', regionName: 'Zona Lumbar L2', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.42 } },
  { regionId: 'SPINE_LUMBAR_L3', regionName: 'Zona Lumbar L3', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.44 } },
  { regionId: 'SPINE_LUMBAR_L4', regionName: 'Zona Lumbar L4', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.46 } },
  { regionId: 'SPINE_LUMBAR_L5', regionName: 'Zona Lumbar L5', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.48 } },
  { regionId: 'PELVIS_SACROILIAC_R', regionName: 'Articulación Sacroilíaca - Derecha', category: 'TRUNK_SPINE', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.45, y: 0.50 } },

  // ── Hip & Lower Limb ────────────────────────────────────────────────
  { regionId: 'HIP_R_GLUTEUS_MAX', regionName: 'Glúteo Mayor - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.40, y: 0.52 } },
  { regionId: 'HIP_R_GLUTEUS_MED', regionName: 'Glúteo Medio - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.38, y: 0.50 } },
  { regionId: 'HIP_R_GLUTEUS_MIN', regionName: 'Glúteo Menor - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.38, y: 0.51 } },
  { regionId: 'HIP_R_PIRIFORMIS', regionName: 'Piriforme - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.42, y: 0.53 } },
  { regionId: 'HIP_R_TFL', regionName: 'Tensor de la Fascia Lata (Banda IT) - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'LATERAL_RIGHT', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.50, y: 0.55 } },
  { regionId: 'THIGH_R_HAMSTRING_BF', regionName: 'Bíceps Femoral - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.38, y: 0.62 } },
  { regionId: 'THIGH_R_HAMSTRING_ST', regionName: 'Semitendinoso - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.42, y: 0.63 } },
  { regionId: 'THIGH_R_HAMSTRING_SM', regionName: 'Semimembranoso - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.43, y: 0.64 } },
  { regionId: 'THIGH_R_QUAD_RF', regionName: 'Recto Femoral - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.58, y: 0.60 } },
  { regionId: 'THIGH_R_QUAD_VM', regionName: 'Vasto Medial - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.55, y: 0.65 } },
  { regionId: 'THIGH_R_QUAD_VL', regionName: 'Vasto Lateral - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.62, y: 0.62 } },
  { regionId: 'THIGH_R_QUAD_VI', regionName: 'Vasto Intermedio - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.58, y: 0.63 } },
  { regionId: 'KNEE_R_PATELLAR_TENDON', regionName: 'Tendón Rotuliano - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.57, y: 0.70 } },
  { regionId: 'KNEE_R_ACL', regionName: 'Ligamento Cruzado Anterior - Rodilla Derecha', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.54, y: 0.72 } },
  { regionId: 'KNEE_R_PCL', regionName: 'Ligamento Cruzado Posterior - Rodilla Derecha', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.44, y: 0.72 } },
  { regionId: 'KNEE_R_MCL', regionName: 'Ligamento Colateral Medial - Rodilla Derecha', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.52, y: 0.71 } },
  { regionId: 'KNEE_R_LCL', regionName: 'Ligamento Colateral Lateral - Rodilla Derecha', category: 'HIP_LOWER_LIMB', defaultView: 'ANTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.60, y: 0.71 } },
  { regionId: 'LEG_R_GASTROCNEMIUS_MED', regionName: 'Gastrocnemio Medial - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.44, y: 0.78 } },
  { regionId: 'LEG_R_GASTROCNEMIUS_LAT', regionName: 'Gastrocnemio Lateral - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'SUPERFICIAL_MUSCULAR', defaultCoordinates: { x: 0.38, y: 0.78 } },
  { regionId: 'LEG_R_SOLEUS', regionName: 'Sóleo - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'DEEP_MUSCULAR', defaultCoordinates: { x: 0.42, y: 0.82 } },
  { regionId: 'LEG_R_ACHILLES_TENDON', regionName: 'Tendón de Aquiles - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'POSTERIOR', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.42, y: 0.88 } },
  { regionId: 'ANKLE_R_ATFL', regionName: 'Ligamento Peroneoastragalino Anterior (ATFL) - Derecho', category: 'HIP_LOWER_LIMB', defaultView: 'LATERAL_RIGHT', defaultLayer: 'LIGAMENT_ARTICULAR', defaultCoordinates: { x: 0.50, y: 0.92 } },
];
