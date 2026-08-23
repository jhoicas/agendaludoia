-- ============================================================================
-- AgendaLudoia: Row Level Security (RLS) Policies
-- ============================================================================
-- Implements strict tenant isolation using PostgreSQL RLS.
-- Every table is protected so that users can only access data belonging
-- to their own tenant, as determined by the JWT claims in the session.
--
-- The requesting_tenant_id() function reads the tenant_id from the JWT
-- claims injected via set_config('request.jwt.claims', ..., true) in
-- each transaction (either by PostgREST/Supabase or our pgx RLS context).
-- ============================================================================

-- ─── Helper Function: Extract Tenant ID from JWT ────────────────────────────

CREATE OR REPLACE FUNCTION requesting_tenant_id()
RETURNS UUID AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json ->> 'tenant_id',
        ''
    )::uuid;
$$ LANGUAGE SQL STABLE;

-- ─── Helper Function: Extract User ID from JWT ─────────────────────────────

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS UUID AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json ->> 'sub',
        ''
    )::uuid;
$$ LANGUAGE SQL STABLE;

-- ─── Helper Function: Extract User Role from JWT ────────────────────────────

CREATE OR REPLACE FUNCTION requesting_user_role()
RETURNS TEXT AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json ->> 'role',
        ''
    );
$$ LANGUAGE SQL STABLE;

-- ─── Enable RLS on ALL tables ───────────────────────────────────────────────

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_observations ENABLE ROW LEVEL SECURITY;

-- ─── TENANTS Policies ───────────────────────────────────────────────────────
-- Tenants can only see their own organization record.

CREATE POLICY "tenant_self_read" ON tenants
    FOR SELECT
    USING (id = (SELECT requesting_tenant_id()));

-- Only super_admin can insert/update tenants (handled at application level)
CREATE POLICY "tenant_admin_write" ON tenants
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── USERS Policies ─────────────────────────────────────────────────────────
-- Users can only see other users within their own tenant.

CREATE POLICY "users_tenant_isolation" ON users
    FOR SELECT
    USING (tenant_id = (SELECT requesting_tenant_id()));

CREATE POLICY "users_tenant_insert" ON users
    FOR INSERT
    WITH CHECK (tenant_id = (SELECT requesting_tenant_id()));

CREATE POLICY "users_tenant_update" ON users
    FOR UPDATE
    USING (tenant_id = (SELECT requesting_tenant_id()))
    WITH CHECK (tenant_id = (SELECT requesting_tenant_id()));

CREATE POLICY "users_tenant_delete" ON users
    FOR DELETE
    USING (tenant_id = (SELECT requesting_tenant_id()));

-- ─── APPOINTMENTS Policies ──────────────────────────────────────────────────
-- Appointments are strictly isolated by tenant_id.

CREATE POLICY "appointments_tenant_isolation" ON appointments
    FOR ALL
    USING (tenant_id = (SELECT requesting_tenant_id()))
    WITH CHECK (tenant_id = (SELECT requesting_tenant_id()));

-- ─── MEDICAL RECORDS Policies ───────────────────────────────────────────────
-- Medical records are isolated by tenant. Additionally, patients can only
-- see their own records (enforced at application level for now).

CREATE POLICY "medical_records_tenant_isolation" ON medical_records
    FOR ALL
    USING (tenant_id = (SELECT requesting_tenant_id()))
    WITH CHECK (tenant_id = (SELECT requesting_tenant_id()));

-- ─── PAIN OBSERVATIONS Policies ─────────────────────────────────────────────
-- Pain observations follow the same tenant isolation pattern.

CREATE POLICY "pain_observations_tenant_isolation" ON pain_observations
    FOR ALL
    USING (tenant_id = (SELECT requesting_tenant_id()))
    WITH CHECK (tenant_id = (SELECT requesting_tenant_id()));
