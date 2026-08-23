import { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeAppointmentPayload {
  id: string;
  patient_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: string;
  tenant_id: string;
}

interface UseRealtimeAppointmentsProps {
  onAppointmentChange?: (payload: RealtimePostgresChangesPayload<RealtimeAppointmentPayload>) => void;
}

/**
 * Custom hook para suscripción en vivo a la tabla appointments usando Supabase Realtime.
 * Escucha eventos INSERT, UPDATE y DELETE con filtro RLS automático.
 */
export function useRealtimeAppointments({ onAppointmentChange }: UseRealtimeAppointmentsProps = {}) {
  const { session } = useAuth();
  const [realtimeToast, setRealtimeToast] = useState<{ message: string; type: 'insert' | 'update' | 'delete' } | null>(null);

  useEffect(() => {
    // Inicializar la suscripción solo si existe una sesión/cliente activo
    const channel = supabase
      .channel('appointments-realtime-channel')
      .on<RealtimeAppointmentPayload>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          // Disparar callback para actualización de caché/estado
          onAppointmentChange?.(payload);

          // Disparar feedback visual según tipo de evento
          if (payload.eventType === 'INSERT') {
            setRealtimeToast({
              message: '📅 Nueva cita agendada en vivo',
              type: 'insert',
            });
          } else if (payload.eventType === 'UPDATE') {
            setRealtimeToast({
              message: '🔄 Estado de cita actualizado en vivo',
              type: 'update',
            });
          } else if (payload.eventType === 'DELETE') {
            setRealtimeToast({
              message: '🗑️ Cita removida de la agenda',
              type: 'delete',
            });
          }

          // Auto-ocultar Toast después de 4 segundos
          setTimeout(() => {
            setRealtimeToast(null);
          }, 4000);
        }
      )
      .subscribe();

    // Cleanup: Desuscribirse del canal al desmontar para evitar memory leaks
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, onAppointmentChange]);

  return {
    realtimeToast,
    clearToast: () => setRealtimeToast(null),
  };
}
