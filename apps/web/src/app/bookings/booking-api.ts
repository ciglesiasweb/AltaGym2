import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Discipline {
  id: string;
  name: string;
}

export interface GroupSession {
  id: string;
  disciplineId: string;
  discipline: string;
  date: string;
  startsAt: string;
  endsAt: string;
  time: string;
  durationMinutes: number;
  monitor: string;
  room: string;
  capacity: number;
  availableSpots: number;
  status: 'SCHEDULED' | 'CANCELLED';
  isBookedByClient: boolean;
  hasConflict: boolean;
  availability: 'AVAILABLE' | 'FULL' | 'WINDOW_CLOSED' | 'BOOKED' | 'CONFLICT' | 'UNAVAILABLE';
  reservable: boolean;
}

export interface OwnBooking {
  id: string;
  type: 'GROUP' | 'PRIVATE';
  startsAt: string;
  endsAt: string;
  date: string;
  time: string;
  discipline?: string;
  monitor: string;
  room?: string;
  status: 'ACTIVE' | 'CONFIRMED';
}

export interface BookingConfirmation {
  id: string;
  groupSessionId: string;
  bookedAt: string;
  startsAt: string;
  status: 'ACTIVE';
}

@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly http = inject(HttpClient);

  async listDisciplines(): Promise<Discipline[]> {
    const response = await firstValueFrom(
      this.http.get<{ disciplines: Discipline[] }>('/api/disciplines'),
    );
    return response.disciplines;
  }

  async listGroupSessions(disciplineId: string): Promise<GroupSession[]> {
    const params = new HttpParams().set('disciplineId', disciplineId);
    const response = await firstValueFrom(
      this.http.get<{ sessions: GroupSession[] }>('/api/group-sessions', { params }),
    );
    return response.sessions;
  }

  async getGroupSession(groupSessionId: string): Promise<GroupSession> {
    const response = await firstValueFrom(
      this.http.get<{ session: GroupSession }>(
        `/api/group-sessions/${encodeURIComponent(groupSessionId)}`,
      ),
    );
    return response.session;
  }

  async listOwnUpcomingBookings(): Promise<OwnBooking[]> {
    const response = await firstValueFrom(
      this.http.get<{ bookings: OwnBooking[] }>('/api/bookings'),
    );
    return response.bookings;
  }

  async getOwnBookingForSession(groupSessionId: string): Promise<BookingConfirmation | null> {
    const response = await firstValueFrom(
      this.http.get<{ booking: BookingConfirmation | null }>(
        `/api/group-sessions/${encodeURIComponent(groupSessionId)}/my-booking`,
      ),
    );
    return response.booking;
  }

  async confirmGroupBooking(groupSessionId: string): Promise<BookingConfirmation> {
    const response = await firstValueFrom(
      this.http.post<{ booking: BookingConfirmation }>(
        `/api/group-sessions/${encodeURIComponent(groupSessionId)}/bookings`,
        {},
      ),
    );
    return response.booking;
  }
}
