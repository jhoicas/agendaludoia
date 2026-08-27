-- ==============================================================================
-- FASE 2: MIGRACIÓN SUPABASE - CONSOLIDACIÓN ESQUEMAS KINESYS CLINICAL PLATFORM
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CONFIGURACIÓN DE LOGOS / WHITE-LABELING (BrandingCustomizer)
-- ==============================================================================

-- Actualizar la tabla 'tenants' para soportar logo_url, primary_color y settings
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#004870',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"brand_name_display": "both", "theme": "light"}'::jsonb;

-- Comentarios de documentación en esquema
COMMENT ON COLUMN public.tenants.logo_url IS 'URL pública del logo de la clínica en Supabase Storage';
COMMENT ON COLUMN public.tenants.primary_color IS 'Código HEX del color principal corporativo para personalización de marca';
COMMENT ON COLUMN public.tenants.settings IS 'Configuraciones adicionales de visualización y personalización';

-- Crear el Bucket de Storage para Logos de Clínicas (Requiere permisos superuser)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant_logos',
  'tenant_logos',
  true,
  3145728, -- 3MB límite
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 3145728;

-- Políticas RLS para Storage (simplificado)
CREATE POLICY "Logos de clínicas son públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant_logos');

CREATE POLICY "Admins pueden gestionar logos"
ON storage.objects FOR ALL
USING (bucket_id = 'tenant_logos' AND (auth.jwt() ->> 'role') IN ('clinic_admin', 'super_admin'));

-- ==============================================================================
-- 3. PERFILES DE PROFESIONALES, RESEÑAS Y LISTA DE ESPERA (Patient Portal)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    bio TEXT,
    alma_mater TEXT,
    graduation_year INTEGER,
    years_of_experience INTEGER,
    social_links JSONB DEFAULT '{}'::jsonb,
    languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    consultation_fee NUMERIC(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    rating_average NUMERIC(3,1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_prof_profile UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'approved', 'pending', 'rejected'
    consultation_date DATE,
    treatment_category TEXT,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_contact TEXT NOT NULL,
    professional_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_date DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'contacted', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CONSULTA MÉDICA GENERAL (DoctorDashboard / Pacientes, SOAP, Prescripciones)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.pacientes_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    fhir_resource_id VARCHAR(100),
    identifier_type VARCHAR(20) NOT NULL DEFAULT 'CC',
    identifier_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'unknown',
    birth_date DATE NOT NULL,
    telecom_phone VARCHAR(50),
    telecom_email VARCHAR(150),
    address_line TEXT,
    blood_type VARCHAR(10) DEFAULT 'O+',
    known_allergies TEXT[] DEFAULT ARRAY['Ninguna conocida']::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_patient_tenant_identifier UNIQUE (tenant_id, identifier_type, identifier_number)
);

CREATE TABLE IF NOT EXISTS public.consultas_soap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.pacientes_clinicos(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    encounter_type VARCHAR(50) NOT NULL DEFAULT 'control',
    encounter_date DATE DEFAULT CURRENT_DATE,
    subjective JSONB NOT NULL DEFAULT '{}'::JSONB,
    objective JSONB NOT NULL DEFAULT '{}'::JSONB,
    assessment JSONB NOT NULL DEFAULT '{}'::JSONB,
    plan JSONB NOT NULL DEFAULT '{}'::JSONB,
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.pacientes_clinicos(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES public.consultas_soap(id) ON DELETE SET NULL,
    practitioner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    prescription_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    medications JSONB NOT NULL DEFAULT '[]'::JSONB,
    general_instructions TEXT,
    status VARCHAR(30) DEFAULT 'active',
    digital_signature_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. MÓDULO NUTRICIONAL (Antropometría, Planes y FHIR NutritionOrder)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.evaluaciones_antropometricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.pacientes_clinicos(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES public.users(id),
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    age INTEGER NOT NULL CHECK (age >= 0),
    gender TEXT NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    height_cm NUMERIC(5,2) NOT NULL,
    activity_factor NUMERIC(3,2) NOT NULL DEFAULT 1.375,
    skinfold_triceps_mm NUMERIC(4,1) NOT NULL,
    skinfold_subscapular_mm NUMERIC(4,1) NOT NULL,
    skinfold_suprailiac_mm NUMERIC(4,1) NOT NULL,
    skinfold_abdominal_mm NUMERIC(4,1) NOT NULL,
    skinfold_biceps_mm NUMERIC(4,1),
    skinfold_thigh_mm NUMERIC(4,1),
    skinfold_calf_mm NUMERIC(4,1),
    waist_cm NUMERIC(5,1) NOT NULL,
    hip_cm NUMERIC(5,1) NOT NULL,
    relaxed_arm_cm NUMERIC(4,1),
    contracted_arm_cm NUMERIC(4,1),
    thigh_cm NUMERIC(4,1),
    calf_cm NUMERIC(4,1),
    neck_cm NUMERIC(4,1),
    bmi NUMERIC(4,1) NOT NULL,
    bmr_kcal INTEGER NOT NULL,
    tdee_kcal INTEGER NOT NULL,
    waist_hip_ratio NUMERIC(3,2) NOT NULL,
    body_fat_percentage NUMERIC(4,1) NOT NULL,
    fat_mass_kg NUMERIC(5,2) NOT NULL,
    fat_free_mass_kg NUMERIC(5,2) NOT NULL,
    cardiovascular_risk_level TEXT NOT NULL,
    clinical_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.planes_nutricionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.pacientes_clinicos(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES public.users(id),
    nutritionist_name TEXT,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL DEFAULT 'terapeutico_clinico',
    status TEXT NOT NULL DEFAULT 'active',
    caloric_target_kcal INTEGER NOT NULL,
    macros_target JSONB NOT NULL,
    meals JSONB NOT NULL,
    clinical_restrictions TEXT[] DEFAULT '{}',
    active_fhir_order_id TEXT,
    notes_and_recommendations TEXT,
    hydration_target_liters NUMERIC(3,1) DEFAULT 2.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ordenes_nutricion_fhir (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.pacientes_clinicos(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.users(id),
    practitioner_name TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active',
    diet_category TEXT NOT NULL DEFAULT 'therapeutic',
    clinical_indication TEXT NOT NULL,
    restrictions JSONB NOT NULL DEFAULT '[]',
    oral_diet_details JSONB NOT NULL DEFAULT '{}',
    fhir_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. HABILITACIÓN ROW LEVEL SECURITY (RLS) MULTITENANT
-- ==============================================================================

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_soap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones_antropometricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_nutricionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_nutricion_fhir ENABLE ROW LEVEL SECURITY;

-- Helper policy function para obtener tenant_id del JWT
CREATE OR REPLACE FUNCTION auth.jwt_tenant_id()
RETURNS UUID AS $$
    SELECT COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id')::UUID,
        (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Políticas Genéricas Tenant Isolation
CREATE POLICY "Tenant isolation (SELECT)"
    ON public.pacientes_clinicos FOR SELECT
    USING (tenant_id = auth.jwt_tenant_id() OR auth.jwt_tenant_id() = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Tenant isolation (INSERT)"
    ON public.pacientes_clinicos FOR INSERT
    WITH CHECK (tenant_id = auth.jwt_tenant_id() OR auth.jwt_tenant_id() = '00000000-0000-0000-0000-000000000000'::UUID);

CREATE POLICY "Tenant isolation (UPDATE)"
    ON public.pacientes_clinicos FOR UPDATE
    USING (tenant_id = auth.jwt_tenant_id() OR auth.jwt_tenant_id() = '00000000-0000-0000-0000-000000000000'::UUID);

-- Se asume replicación de la misma lógica para las otras tablas.


-- ==============================================================================
-- 7. TRIGGER DE SINCRONIZACIÓN AUTH.USERS -> PUBLIC.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'patient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
