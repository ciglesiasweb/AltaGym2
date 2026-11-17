import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BookingApi, type BookingConfirmation } from '../booking-api';

type ResultState = 'checking' | 'confirmed' | 'not-found' | 'unknown';

@Component({
  selector: 'app-booking-result-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './booking-result-page.html',
  styleUrl: './booking-result-page.scss',
})
export class BookingResultPage {
  private readonly api = inject(BookingApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly groupSessionId = signal('');
  protected readonly result = signal<ResultState>('checking');
  protected readonly booking = signal<BookingConfirmation | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parameters) => {
        const id = parameters.get('groupSessionId');
        if (id) {
          this.groupSessionId.set(id);
          void this.reconcile(id);
        }
      });
  }

  protected async reconcile(id = this.groupSessionId()): Promise<void> {
    if (!id) {
      this.result.set('unknown');
      return;
    }

    this.result.set('checking');
    this.booking.set(null);
    try {
      const booking = await this.api.getOwnBookingForSession(id);
      this.booking.set(booking);
      this.result.set(booking ? 'confirmed' : 'not-found');
    } catch {
      this.result.set('unknown');
    }
  }
}
