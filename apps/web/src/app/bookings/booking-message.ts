import { HttpErrorResponse } from '@angular/common/http';

export function bookingErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'No se pudieron cargar los datos. Inténtalo de nuevo.';
  }

  const code = error.error?.error;
  switch (code) {
    case 'SESSION_STARTED':
      return 'La clase ya ha comenzado y no admite nuevas reservas.';
    case 'BOOKING_WINDOW_CLOSED':
      return 'La ventana de reserva de esta clase está cerrada.';
    case 'CAPACITY_EXCEEDED':
      return 'La clase se ha completado. Elige otra sesión.';
    case 'BOOKING_CONFLICT':
      return 'Ya tienes otra actividad en ese horario.';
    case 'SESSION_UNAVAILABLE':
      return 'La clase ya no está disponible. Elige otra sesión.';
    default:
      return 'No se pudieron cargar los datos. Inténtalo de nuevo.';
  }
}
