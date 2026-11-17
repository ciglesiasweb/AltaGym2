import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, convertToParamMap } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { appRoutes } from '../app.routes';
import {
  BookingApi,
  type BookingConfirmation,
  type GroupSession,
} from './booking-api';
import { BookingConfirmationPage } from './booking-confirmation-page';
import { BookingResultPage } from './booking-result-page';
import { GroupSessionDetailPage } from './group-session-detail-page';
import { MyBookingsPage } from './my-bookings-page';

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
  availability: 'AVAILABLE',
  reservable: true,
};

const booking: BookingConfirmation = {
  id: 'booking-a',
  groupSessionId: session.id,
  bookedAt: '2026-11-18T12:00:00.000Z',
  startsAt: session.startsAt,
  status: 'ACTIVE',
};

function routeFor(groupSessionId = session.id) {
  return {
    paramMap: of(convertToParamMap({ groupSessionId })),
    queryParamMap: of(convertToParamMap({ disciplineId: session.disciplineId })),
    snapshot: {
      paramMap: convertToParamMap({ groupSessionId }),
      queryParamMap: convertToParamMap({ disciplineId: session.disciplineId }),
    },
  };
}

describe('group booking web flow', () => {
  it('navigates from own bookings through a class confirmation and back to the updated list', async () => {
    const updatedBookings = [
      {
        id: booking.id,
        type: 'GROUP' as const,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        date: session.date,
        time: session.time,
        discipline: session.discipline,
        monitor: session.monitor,
        room: session.room,
        status: 'ACTIVE' as const,
      },
    ];
    const api = {
      listOwnUpcomingBookings: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(updatedBookings),
      listDisciplines: vi.fn().mockResolvedValue([
        { id: session.disciplineId, name: session.discipline },
      ]),
      listGroupSessions: vi.fn().mockResolvedValue([session]),
      getGroupSession: vi.fn().mockResolvedValue(session),
      confirmGroupBooking: vi.fn().mockResolvedValue(booking),
      getOwnBookingForSession: vi.fn().mockResolvedValue(booking),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        { provide: BookingApi, useValue: api },
      ],
    });
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    await harness.navigateByUrl('/reservas', MyBookingsPage);
    await harness.fixture.whenStable();

    harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'a[href="/reservar"]',
    )?.click();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/reservar');

    const discipline = harness.routeNativeElement?.querySelector('select');
    expect(discipline).not.toBeNull();
    discipline!.value = session.disciplineId;
    discipline!.dispatchEvent(new Event('change', { bubbles: true }));
    await harness.fixture.whenStable();
    expect(api.listGroupSessions).toHaveBeenCalledWith(session.disciplineId);

    harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'a[aria-label="Ver clase de Zumba a las 13:00"]',
    )?.click();
    await harness.fixture.whenStable();
    expect(router.url).toContain(`/reservar/${session.id}`);

    harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'a.primary-link',
    )?.click();
    await harness.fixture.whenStable();
    expect(router.url).toContain('/confirmar');

    harness.routeNativeElement?.querySelector<HTMLButtonElement>(
      'button.primary-button',
    )?.click();
    await harness.fixture.whenStable();
    expect(api.confirmGroupBooking).toHaveBeenCalledWith(session.id);
    expect(router.url).toContain('/resultado');

    harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'a[href="/reservas"]',
    )?.click();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/reservas');
    expect(api.listOwnUpcomingBookings).toHaveBeenCalledTimes(2);
    expect(harness.routeNativeElement?.textContent).toContain('Zumba');
  });

  it('does not offer confirmation for a full or closed-window class', async () => {
    for (const [availability, message] of [
      ['FULL', 'La clase está completa. No se admiten nuevas reservas.'],
      ['WINDOW_CLOSED', 'La ventana de reserva está cerrada para esta clase.'],
    ] as const) {
      const api = {
        getGroupSession: vi.fn().mockResolvedValue({
          ...session,
          availability,
          reservable: false,
          availableSpots: availability === 'FULL' ? 0 : session.availableSpots,
        }),
      };
      TestBed.configureTestingModule({
        imports: [GroupSessionDetailPage],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: routeFor() },
          { provide: BookingApi, useValue: api },
        ],
      });

      const fixture = TestBed.createComponent(GroupSessionDetailPage);
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain(message);
      expect(element.textContent).not.toContain('Reservar esta clase');
      expect(api.getGroupSession).toHaveBeenCalledWith(session.id);
      TestBed.resetTestingModule();
    }
  });

  it('submits one confirmation for the authenticated client without sending a clientId', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const api = TestBed.inject(BookingApi);
    const backend = TestBed.inject(HttpTestingController);

    const responsePromise = api.confirmGroupBooking('group-session/a');
    const request = backend.expectOne('/api/group-sessions/group-session%2Fa/bookings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ booking });

    await expect(responsePromise).resolves.toEqual(booking);
    backend.verify();
  });

  it('reconciles an uncertain confirmation to success or a safe retry state', async () => {
    for (const [ownBooking, expectedText] of [
      [booking, 'Tu plaza está reservada'],
      [null, 'Puedes volver a intentarlo.'],
    ] as const) {
      const api = {
        getOwnBookingForSession: vi.fn().mockResolvedValue(ownBooking),
      };
      TestBed.configureTestingModule({
        imports: [BookingResultPage],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: routeFor() },
          { provide: BookingApi, useValue: api },
        ],
      });

      const fixture = TestBed.createComponent(BookingResultPage);
      await fixture.whenStable();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain(expectedText);
      expect(api.getOwnBookingForSession).toHaveBeenCalledWith(session.id);
      TestBed.resetTestingModule();
    }
  });

  it('does not report a final outcome when reconciliation fails', async () => {
    const api = {
      getOwnBookingForSession: vi.fn().mockRejectedValue(new Error('database unavailable')),
    };
    TestBed.configureTestingModule({
      imports: [BookingResultPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeFor() },
        { provide: BookingApi, useValue: api },
      ],
    });

    const fixture = TestBed.createComponent(BookingResultPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No se pudo determinar el resultado');
    expect(element.textContent).not.toContain('Tu plaza está reservada');
    expect(element.textContent).not.toContain('No encontramos una reserva activa');
  });

  it('does not automatically repeat a confirmation after authentication expires', async () => {
    const api = {
      getGroupSession: vi.fn().mockResolvedValue(session),
      confirmGroupBooking: vi.fn().mockRejectedValue(
        new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
      ),
    };
    TestBed.configureTestingModule({
      imports: [BookingConfirmationPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeFor() },
        { provide: BookingApi, useValue: api },
      ],
    });
    const fixture = TestBed.createComponent(BookingConfirmationPage);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await fixture.whenStable();

    await fixture.componentInstance.confirm();

    expect(api.confirmGroupBooking).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toContain('No se pudieron cargar los datos');
  });
});
