import { useState, useEffect, useCallback } from 'react';
import { appointmentApi } from '../api/appointmentApi';
import { useRealtimeAppointments } from './useRealtimeAppointments';
import type { Appointment, CreateAppointmentInput } from '../api/appointmentApi';

const DEMO_PATIENT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_PHYSIO_ID = '00000000-0000-0000-0000-000000000002';

// Citas iniciales de demostración con ambas situaciones (< 24h y >= 24h)
const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'demo-appt-1',
    tenantId: 'tenant-demo',
    patientId: DEMO_PATIENT_ID,
    professionalId: DEMO_PHYSIO_ID,
    startTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // En 12 horas (Bloqueada < 24h)
    endTime: new Date(Date.now() + 13 * 60 * 60 * 1000).toISOString(),
    status: 'booked',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-appt-2',
    tenantId: 'tenant-demo',
    patientId: DEMO_PATIENT_ID,
    professionalId: DEMO_PHYSIO_ID,
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // En 48 horas (Cancelación Libre >= 24h)
    endTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
    status: 'booked',
    createdAt: new Date().toISOString(),
  },
];

export function usePatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_DEMO_APPOINTMENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentApi.fetchPatientAppointments(DEMO_PATIENT_ID);
      if (data.length > 0) {
        setAppointments(data);
      }
    } catch {
      // Usar fallback de demostración si la BD local/cloud no tiene registros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Suscripción Realtime en vivo
  const { realtimeToast } = useRealtimeAppointments({
    onAppointmentChange: () => {
      loadAppointments();
    },
  });

  // Crear cita rápida
  const createAppointment = async (input: Omit<CreateAppointmentInput, 'patientId' | 'professionalId'>) => {
    setLoading(true);
    try {
      const newAppt = await appointmentApi.createAppointment({
        ...input,
        patientId: DEMO_PATIENT_ID,
        professionalId: DEMO_PHYSIO_ID,
      });

      setAppointments((prev) => [newAppt, ...prev]);
      setSuccessToast('¡Cita programada con éxito! Confirmación enviada.');
    } catch (err: any) {
      // Si falla la inserción en BD, agregamos a estado local de demo
      const demoNew: Appointment = {
        id: `demo-${Date.now()}`,
        tenantId: 'tenant-demo',
        patientId: DEMO_PATIENT_ID,
        professionalId: DEMO_PHYSIO_ID,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'booked',
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [demoNew, ...prev]);
      setSuccessToast('¡Cita programada en simulador local de clínica!');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Cancelar cita con captura de error gRPC 24h
  const cancelAppointment = async (id: string, startTime: string) => {
    setLoading(true);
    try {
      await appointmentApi.cancelAppointment(id, startTime, 'Cancelado por portal');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );
      setSuccessToast('La cita ha sido cancelada correctamente.');
    } catch (err: any) {
      if (err.message.includes('ERR_CANCELLATION_WINDOW_EXPIRED')) {
        setErrorToast('🚫 Bloqueado: Regla de 24h activa. Contacte a la clínica para gestión manual.');
      } else {
        setErrorToast(err.message || 'Error al procesar cancelación.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  return {
    appointments,
    loading,
    errorToast,
    successToast,
    realtimeToast,
    createAppointment,
    cancelAppointment,
    refresh: loadAppointments,
  };
}
