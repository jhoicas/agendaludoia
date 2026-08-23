import { supabase } from '../../../services/supabaseClient';

export interface Appointment {
  id: string;
  tenantId: string;
  patientId: string;
  professionalId: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: 'booked' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  cancellationReason?: string;
  createdAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  professionalId: string;
  startTime: string;
  endTime: string;
}

/**
 * Cliente de servicios de agendamiento.
 * Soporta gRPC-Web REST fallback directo a Supabase con RLS tenant_id.
 */
export const appointmentApi = {
  // Obtenemos las citas del paciente actual
  async fetchPatientAppointments(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_time', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((item) => ({
      id: item.id,
      tenantId: item.tenant_id,
      patientId: item.patient_id,
      professionalId: item.professional_id,
      startTime: item.start_time,
      endTime: item.end_time,
      status: item.status,
      cancellationReason: item.cancellation_reason,
      createdAt: item.created_at,
    }));
  },

  // Crear una nueva cita
  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: input.patientId,
        professional_id: input.professionalId,
        start_time: input.startTime,
        end_time: input.endTime,
        status: 'booked',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      tenantId: data.tenant_id,
      patientId: data.patient_id,
      professionalId: data.professional_id,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      createdAt: data.created_at,
    };
  },

  // Cancelar cita con validación de la Regla de 24 Horas
  async cancelAppointment(appointmentId: string, startTime: string, reason: string): Promise<void> {
    const apptTime = new Date(startTime).getTime();
    const now = new Date().getTime();
    const deltaHours = (apptTime - now) / (1000 * 60 * 60);

    // Validación estricta de la regla de 24 horas en el cliente (coincidente con el backend Go)
    if (deltaHours < 24) {
      throw new Error('ERR_CANCELLATION_WINDOW_EXPIRED: La cita se encuentra dentro del margen de 24 horas.');
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelado por paciente',
      })
      .eq('id', appointmentId);

    if (error) throw new Error(error.message);
  },
};
