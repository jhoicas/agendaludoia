import { useState } from 'react';
import { SideNavBar } from '../../../components/layout/SideNavBar';
import { TopNavBar } from '../../../components/layout/TopNavBar';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { check24HourRule } from '../utils/rule24h';

export function PatientPortalPage() {
  const {
    appointments,
    loading,
    errorToast,
    successToast,
    realtimeToast,
    createAppointment,
    cancelAppointment,
  } = usePatientAppointments();

  // Estado del formulario de reserva rápida
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert('Por favor selecciona una fecha para la cita.');
      return;
    }

    const start = new Date(`${selectedDate}T${selectedTime}:00`);
    const end = new Date(start.getTime() + 45 * 60 * 1000); // 45 minutos de consulta

    createAppointment({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  };

  return (
    <div className="min-h-screen flex bg-background font-sans text-on-background overflow-hidden">
      <SideNavBar />

      <main className="flex-1 ml-0 md:ml-72 flex flex-col h-screen relative overflow-hidden">
        <TopNavBar />

        {/* Toast Realtime Flotante En Vivo (Stitch Glassmorphism) */}
        {realtimeToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-glass-surface backdrop-blur-md text-primary border border-primary/30 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined text-xl">sensors</span>
            <span className="text-xs font-bold">{realtimeToast.message}</span>
          </div>
        )}

        {/* Notificaciones Toast Flotantes Estilo Stitch */}
        {errorToast && (
          <div className="fixed top-20 right-6 z-50 bg-error-container text-on-error-container border border-error/30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined text-xl">block</span>
            <span className="text-xs font-bold">{errorToast}</span>
          </div>
        )}

        {successToast && (
          <div className="fixed top-20 right-6 z-50 bg-secondary-container text-on-secondary-container border border-secondary/30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <span className="text-xs font-bold">{successToast}</span>
          </div>
        )}

        {/* Canvas Workspace */}
        <div className="mt-[72px] flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 bg-surface-container-low">
          {/* Columna Izquierda: Calendario & Lista de Citas */}
          <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-[0_20px_20px_-4px_rgba(2,132,199,0.08)] border border-outline-variant/30 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-2xl font-extrabold text-on-surface">Mis Citas & Agendamiento</h2>
                <p className="text-xs text-on-surface-variant">Protección Financiera Regla de 24h Activa</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {appointments.filter((a) => a.status !== 'cancelled').length} Activas
                </span>
              </div>
            </div>

            {/* Lista de Citas con Evaluación Reactiva de la Regla de 24h */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Próximos Turnos</h3>

              {appointments.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">No tienes citas registradas.</p>
              ) : (
                appointments.map((appt) => {
                  const rule = check24HourRule(appt.startTime);
                  const isCancelled = appt.status === 'cancelled';
                  const dateFormatted = new Date(appt.startTime).toLocaleString('es-CO', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={appt.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isCancelled
                          ? 'bg-surface-container-low/40 border-outline-variant/20 opacity-60'
                          : 'bg-surface-container-lowest border-outline-variant/30 clinical-shadow'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
                            isCancelled
                              ? 'bg-surface-variant text-on-surface-variant'
                              : rule.canCancel
                              ? 'bg-primary-container/20 text-primary'
                              : 'bg-error-container/40 text-error'
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {isCancelled ? 'cancel' : rule.canCancel ? 'event_available' : 'lock_clock'}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-on-surface">{dateFormatted}</p>
                          <p className="text-xs text-on-surface-variant">Consulta Fisioterapia / Evaluación</p>
                          {!isCancelled && (
                            <p className="text-[10px] text-outline mt-0.5">
                              Tiempo restante: {rule.hoursRemaining}h
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botón & Badges de Estado con Regla de 24h */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {isCancelled ? (
                          <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-full">
                            Cancelada
                          </span>
                        ) : rule.canCancel ? (
                          <button
                            onClick={() => cancelAppointment(appt.id, appt.startTime)}
                            disabled={loading}
                            className="bg-surface-container hover:bg-error-container/40 text-error font-semibold text-xs px-4 py-2 rounded-xl border border-error/30 transition cursor-pointer"
                          >
                            Cancelar Cita (Libre)
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="bg-error-container text-on-error-container font-bold text-[11px] px-3 py-1.5 rounded-xl border border-error/20 flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-sm">lock</span>
                              Bloqueado: Regla 24h. Contacte a la clínica
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Formulario de Reserva Rápida (Quick Consult Simulator) */}
          <div className="w-full lg:w-[380px] flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_20px_-4px_rgba(2,132,199,0.08)] border border-outline-variant/30 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-outline-variant/20">
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">add_task</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Reserva Rápida de Cita</h3>
                  <p className="text-[11px] text-on-surface-variant">Agendamiento Instantáneo 1-Tap</p>
                </div>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Fecha de la Cita
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Hora de Atención
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="08:00">08:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">calendar_add_on</span>
                  )}
                  {loading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              </form>
            </div>

            {/* Tarjeta Informativa de la Regla de 24h */}
            <div className="bg-surface-container-low/70 rounded-2xl border border-outline-variant/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>Política de Protección 24h</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Las modificaciones y cancelaciones realizadas con más de 24 horas de antelación son 100% gratuitas y automáticas. Dentro de las 24h previas, el sistema bloquea la acción para proteger la agenda profesional.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
