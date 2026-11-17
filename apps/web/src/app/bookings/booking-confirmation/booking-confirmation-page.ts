import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingApi, type GroupSession } from '../booking-api';
import { bookingErrorMessage } from '../booking-message';

@Component({
  selector: 'app-booking-confirmation-page',
  imports: [RouterLink],
  templateUrl: './booking-confirmation-page.html',
  styleUrl: './booking-confirmation-page.scss',
})
export class BookingConfirmationPage {
  private readonly api = inject(BookingApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly groupSessionId = signal('');
  protected readonly disciplineId = signal('');
  protected readonly session = signal<GroupSession | null>(null);
  protected readonly loading = signal(true);
  protected readonly confirming = signal(false);
  protected readonly error = signal('');

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters) => this.disciplineId.set(parameters.get('disciplineId') ?? ''));
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters) => {
        const id = parameters.get('groupSessionId');
        if (id) {
          this.groupSessionId.set(id);
          void this.load(id);
        }
      });
  }

  protected async load(id = this.groupSessionId()): Promise<void> {
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

  protected availabilityMessage(session: GroupSession): string {
    if (session.availability === 'FULL') {
      return 'La clase está completa y no admite nuevas reservas.';
    }
    if (session.availability === 'WINDOW_CLOSED') {
      return 'La ventana de reserva está cerrada.';
    }
    if (session.hasConflict) {
      return 'Ya tienes otra actividad en ese horario.';
    }
    return 'La clase ya no está disponible para reservar.';
  }

  protected async confirm(): Promise<void> {
    const id = this.groupSessionId();
    const session = this.session();
    if (!id || !session?.reservable || this.confirming()) {
      return;
    }

    this.confirming.set(true);
    this.error.set('');
    try {
      await this.api.confirmGroupBooking(id);
      await this.router.navigate(['/reservar', id, 'resultado']);
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 0 || error.status >= 500)
      ) {
        await this.router.navigate(['/reservar', id, 'resultado'], {
          state: { confirmationUncertain: true },
        });
        return;
      }

      this.error.set(bookingErrorMessage(error));
    } finally {
      this.confirming.set(false);
    }
  }
}
