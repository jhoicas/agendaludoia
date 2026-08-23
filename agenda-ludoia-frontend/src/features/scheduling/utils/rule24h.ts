/**
 * Utilidades para calcular y verificar la regla inviolable de 24 horas.
 */

export interface CancellationRuleStatus {
  canCancel: boolean;
  hoursRemaining: number;
  message: string;
}

/**
 * Calcula si una cita se encuentra dentro de la ventana bloqueada de 24 horas.
 */
export function check24HourRule(startTimeIso: string, now: Date = new Date()): CancellationRuleStatus {
  const apptTime = new Date(startTimeIso).getTime();
  const currentTime = now.getTime();
  const deltaMs = apptTime - currentTime;
  const hoursRemaining = deltaMs / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    return {
      canCancel: false,
      hoursRemaining: 0,
      message: 'La cita ya ha concluido o está en curso.',
    };
  }

  if (hoursRemaining < 24) {
    return {
      canCancel: false,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      message: 'Bloqueado: Regla de 24h activa. Contacte a la clínica.',
    };
  }

  return {
    canCancel: true,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    message: 'Cancelación libre disponible.',
  };
}
