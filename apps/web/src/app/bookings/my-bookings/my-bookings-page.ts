import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingApi, type OwnBooking } from '../booking-api';
import { bookingErrorMessage } from '../booking-message';

@Component({
  selector: 'app-my-bookings-page',
  imports: [RouterLink],
  templateUrl: './my-bookings-page.html',
  styleUrl: './my-bookings-page.scss',
})
export class MyBookingsPage {
  private readonly api = inject(BookingApi);
  protected readonly bookings = signal<OwnBooking[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.bookings.set(await this.api.listOwnUpcomingBookings());
    } catch (error) {
      this.bookings.set([]);
      this.error.set(bookingErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
