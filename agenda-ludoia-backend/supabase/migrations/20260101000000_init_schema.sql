-- ============================================================================
-- AgendaLudoia: Initial Schema Migration
-- ============================================================================
-- Creates the core tables for the multitenant clinical management platform:
-- tenants, users, appointments, medical_records, pain_observations
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- Required for EXCLUDE constraint on appointments

-- ─── TENANTS ────────────────────────────────────────────────────────────────

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    settings JSONB DEFAULT '{
        "timezone": "America/Bogota",
        "default_slot_duration_minutes": 30,
        "cancellation_window_hours": 24,
        "allow_patient_self_book": true,
        "no_show_penalty_enabled": false,
        "no_show_penalty_amount_cents": 0
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast slug lookups (used in tenant routing)
CREATE INDEX idx_tenants_slug ON tenants (slug);

-- ─── USERS ──────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'clinic_admin', 'physio', 'patient')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for tenant-scoped user queries
CREATE INDEX idx_users_tenant_role ON users (tenant_id, role);
CREATE INDEX idx_users_email ON users (email);

-- ─── APPOINTMENTS ───────────────────────────────────────────────────────────

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'cancelled', 'no_show', 'completed')),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- CONSTRAINT: Prevent time slot overlaps per professional (anti-overbooking)
    -- Uses GiST index with btree_gist extension for range-based exclusion.
    -- Only active appointments (not cancelled) are subject to this constraint.
    CONSTRAINT no_professional_overlap EXCLUDE USING gist (
        professional_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    ) WHERE (status NOT IN ('cancelled'))
);

-- Indexes for common query patterns
CREATE INDEX idx_appointments_tenant ON appointments (tenant_id);
CREATE INDEX idx_appointments_professional_time ON appointments (professional_id, start_time, end_time) WHERE status NOT IN ('cancelled');
CREATE INDEX idx_appointments_patient ON appointments (patient_id, start_time DESC);
CREATE INDEX idx_appointments_status ON appointments (tenant_id, status);

-- ─── MEDICAL RECORDS ────────────────────────────────────────────────────────

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    chief_complaint TEXT,
    rom_data JSONB DEFAULT '{}'::jsonb,
    muscle_strength JSONB DEFAULT '{}'::jsonb,
    body_composition JSONB DEFAULT '{}'::jsonb,
    functional_tests JSONB DEFAULT '[]'::jsonb,
    alerts JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for patient history lookups (longitudinal analysis)
CREATE INDEX idx_medical_records_patient ON medical_records (tenant_id, patient_id, created_at DESC);
CREATE INDEX idx_medical_records_professional ON medical_records (tenant_id, professional_id, created_at DESC);

-- GIN index for JSONB queries on alerts (e.g., finding active surgical history alerts)
CREATE INDEX idx_medical_records_alerts ON medical_records USING gin (alerts);

-- ─── PAIN OBSERVATIONS ─────────────────────────────────────────────────────

CREATE TABLE pain_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    observation_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for pain map history queries
CREATE INDEX idx_pain_observations_patient ON pain_observations (tenant_id, patient_id, created_at DESC);
CREATE INDEX idx_pain_observations_record ON pain_observations (medical_record_id);

-- GIN index for querying specific anatomical regions within JSONB
CREATE INDEX idx_pain_observations_data ON pain_observations USING gin (observation_data);

-- ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update triggers
CREATE TRIGGER trigger_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
