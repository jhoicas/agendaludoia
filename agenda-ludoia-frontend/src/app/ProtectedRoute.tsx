import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import type { UserRole } from './providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Componente Guard que protege las rutas requiriendo autenticación y rol válido.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
          <span className="text-xs font-semibold text-on-surface-variant">Cargando sesión segura...</span>
        </div>
      </div>
    );
  }

  // Redirigir a /login si no hay usuario autenticado (Permitir navegación libre en modo dev si no hay credenciales)
  if (!user && import.meta.env.PROD) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos y el usuario no cumple el rol
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
