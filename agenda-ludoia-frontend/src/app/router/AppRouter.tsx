import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { SuperAdminDashboardPage } from '../../features/dashboard/pages/SuperAdminDashboardPage';
import { DemoPainMapPage } from '../../features/pain-map/pages/DemoPainMapPage';
import { PatientPortalPage } from '../../features/scheduling/pages/PatientPortalPage';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../providers/AuthProvider';

function RoleBasedDashboard() {
  const { role } = useAuth();

  if (role === 'super_admin') {
    return <SuperAdminDashboardPage />;
  }

  if (role === 'patient') {
    return <PatientPortalPage />;
  }

  return <DemoPainMapPage />;
}

/**
 * Application router for AgendaLudoia with Protected Routes and RBAC.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public & Auth Routes ──────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── Admin & Clinical Protected Routes ───────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pain-map"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'clinic_admin', 'physio']}>
              <DemoPainMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <PatientPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <PatientPortalPage />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
