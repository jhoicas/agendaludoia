/**
 * Date and time utility functions for AgendaLudoia.
 */

/**
 * Checks if a date is within the 24-hour cancellation window.
 * @param appointmentTime - The scheduled appointment time
 * @param now - Current time (defaults to Date.now())
 * @returns true if within the 24h blackout window (cannot cancel)
 */
export function isWithin24HourWindow(appointmentTime: Date, now: Date = new Date()): boolean {
  const deltaMs = appointmentTime.getTime() - now.getTime();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  return deltaMs < twentyFourHoursMs;
}

/**
 * Formats a duration for display (e.g., "2h 30m").
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Formats a date for display in the user's locale.
 */
export function formatDateTime(date: Date | string, locale = 'es-CO'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns the time remaining until an appointment in human-readable format.
 */
export function timeUntilAppointment(appointmentTime: Date, now: Date = new Date()): string {
  const deltaMs = appointmentTime.getTime() - now.getTime();
  if (deltaMs <= 0) return 'Ahora';

  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  const minutes = Math.floor((deltaMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}
