import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingApi, type GroupSession } from './booking-api';
import { bookingErrorMessage } from './booking-message';

@Component({
  selector: 'app-group-session-detail-page',
  imports: [RouterLink],
  templateUrl: './group-session-detail-page.html',
  styleUrl: './group-session-detail-page.scss',
})
export class GroupSessionDetailPage {
  private readonly api = inject(BookingApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly session = signal<GroupSession | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly disciplineId = signal('');

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters) => this.disciplineId.set(parameters.get('disciplineId') ?? ''));
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters) => {
        const id = parameters.get('groupSessionId');
        if (id) {
          void this.load(id);
        }
      });
  }

  async load(id = this.route.snapshot.paramMap.get('groupSessionId') ?? ''): Promise<void> {
    if (!id) {
      this.session.set(null);
      this.loading.set(false);
      this.error.set('No se pudo encontrar esta clase. Vuelve a consultar las sesiones.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      this.session.set(await this.api.getGroupSession(id));
    } catch (error) {
      this.session.set(null);
      this.error.set(bookingErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  availabilityMessage(session: GroupSession): string {
    switch (session.availability) {
      case 'AVAILABLE':
        return `Hay ${session.availableSpots} plazas disponibles de ${session.capacity}.`;
      case 'FULL':
        return 'La clase está completa. No se admiten nuevas reservas.';
      case 'WINDOW_CLOSED':
        return 'La ventana de reserva está cerrada para esta clase.';
      case 'BOOKED':
        return 'Ya tienes esta clase reservada.';
      case 'CONFLICT':
        return 'Ya tienes otra actividad en ese horario.';
      default:
        return 'Esta clase ya no está disponible para reservar.';
    }
  }
}
