import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BookingApi, type GroupSession } from '../booking-api';
import { BookingConfirmationPage } from './booking-confirmation-page';

const session: GroupSession = {
  id: 'group-session-a',
  disciplineId: 'discipline-a',
  discipline: 'Zumba',
  date: '2026-11-20',
  startsAt: '2026-11-20T12:00:00.000Z',
  endsAt: '2026-11-20T12:45:00.000Z',
  time: '13:00',
  durationMinutes: 45,
  monitor: 'Ada Monitor',
  room: 'Sala 1',
  capacity: 12,
  availableSpots: 3,
  status: 'SCHEDULED',
  isBookedByClient: false,
  hasConflict: false,
  availability: 'UNAVAILABLE',
  reservable: false,
};

describe('booking confirmation availability', () => {
  it.each([
    [{ availability: 'FULL', hasConflict: true }, 'La clase está completa y no admite nuevas reservas.'],
    [{ availability: 'WINDOW_CLOSED', hasConflict: true }, 'La ventana de reserva está cerrada.'],
    [{ availability: 'CONFLICT', hasConflict: true }, 'Ya tienes otra actividad en ese horario.'],
    [{ availability: 'CONFLICT', hasConflict: false }, 'La clase ya no está disponible para reservar.'],
    [{ availability: 'UNAVAILABLE' }, 'La clase ya no está disponible para reservar.'],
  ] satisfies [Partial<GroupSession>, string][])(
    'shows the original message for %o',
    async (overrides, message) => {
      TestBed.configureTestingModule({
        imports: [BookingConfirmationPage],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: of(convertToParamMap({ groupSessionId: session.id })),
              queryParamMap: of(convertToParamMap({ disciplineId: session.disciplineId })),
            },
          },
          {
            provide: BookingApi,
            useValue: { getGroupSession: vi.fn().mockResolvedValue({ ...session, ...overrides }) },
          },
        ],
      });

      const fixture = TestBed.createComponent(BookingConfirmationPage);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('[role="status"]')?.textContent).toBe(message);
      expect(element.querySelector('button.primary-button')).toBeNull();
    },
  );
});
