import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { SuperAdminDashboardPage } from '../../features/dashboard/pages/SuperAdminDashboardPage';
import { DemoPainMapPage } from '../../features/pain-map/pages/DemoPainMapPage';
import { PatientPortalPage } from '../../features/scheduling/pages/PatientPortalPage';
import { PatientsPage } from '../../features/patients/pages/PatientsPage';
import { CalendarPage } from '../../features/scheduling/pages/CalendarPage';
import { AnalyticsPage } from '../../features/analytics/pages/AnalyticsPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';
import { DoctorDashboard } from '../../features/ehr/pages/DoctorDashboard';
import { NutritionistDashboard } from '../../features/nutrition/pages/NutritionistDashboard';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../providers/AuthProvider';

function RoleBasedDashboard() {
  const { role } = useAuth();

  if (role === 'super_admin') {
    return <SuperAdminDashboardPage />;
  }

  if (role === 'clinic_admin') {
    return <Navigate to="/ajustes" replace />;
  }

  if (role === 'general_doctor') {
    return <Navigate to="/medico" replace />;
  }

  if (role === 'nutritionist') {
    return <Navigate to="/nutricion" replace />;
  }

  if (role === 'patient') {
    return <Navigate to="/portal-paciente" replace />;
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
          path="/pacientes"
          element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mapa-dolor"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'clinic_admin', 'physio', 'general_doctor', 'nutritionist']}>
              <DemoPainMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analiticas"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Nuevas rutas clínicas */}
        <Route
          path="/medico"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'clinic_admin', 'general_doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutricion"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'clinic_admin', 'nutritionist']}>
              <NutritionistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal-paciente"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ajustes"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'clinic_admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
