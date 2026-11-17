import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  resolveClientContext: vi.fn(),
  listDisciplines: vi.fn(),
  listGroupSessions: vi.fn(),
  getGroupSession: vi.fn(),
  listOwnUpcomingBookings: vi.fn(),
  getOwnBookingForSession: vi.fn(),
  confirmGroupBooking: vi.fn(),
}));

vi.mock('../../../lib/client-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/client-context')>();
  return { ...actual, resolveClientContext: mocks.resolveClientContext };
});

vi.mock('../../../lib/group-bookings', () => ({
  listDisciplines: mocks.listDisciplines,
  listGroupSessions: mocks.listGroupSessions,
  getGroupSession: mocks.getGroupSession,
  listOwnUpcomingBookings: mocks.listOwnUpcomingBookings,
  getOwnBookingForSession: mocks.getOwnBookingForSession,
  confirmGroupBooking: mocks.confirmGroupBooking,
}));

import { GET as getDisciplines } from '../disciplines/route';
import { GET as getOwnBookings } from '../bookings/route';
import { GET as getSessions } from './route';
import { GET as getSession } from './[groupSessionId]/route';
import { POST as postBooking } from './[groupSessionId]/bookings/route';
import { GET as getOwnBooking } from './[groupSessionId]/my-booking/route';
import { ClientContextError, type ClientAuthContext } from '../../../lib/client-context';

const context: ClientAuthContext = {
  userAccountId: 'account-a',
  clientId: 'client-a',
  subject: 'mock|stable-client-a',
};

function request(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(`https://api.example.test${url}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolveClientContext.mockResolvedValue(context);
});

describe('authenticated group booking routes', () => {
  it('uses the authenticated client for disciplines, sessions and the common bookings list', async () => {
    mocks.listDisciplines.mockResolvedValue([{ id: 'discipline-a', name: 'Zumba' }]);
    mocks.listGroupSessions.mockResolvedValue([{ id: 'session-a' }]);
    mocks.listOwnUpcomingBookings.mockResolvedValue([{ id: 'booking-a' }]);

    const disciplinesResponse = await getDisciplines(request('/api/disciplines'));
    const sessionsResponse = await getSessions(
      request('/api/group-sessions?disciplineId=discipline-a'),
    );
    const bookingsResponse = await getOwnBookings(request('/api/bookings'));

    expect(disciplinesResponse.headers.get('Cache-Control')).toBe('no-store');
    expect(await disciplinesResponse.json()).toEqual({
      disciplines: [{ id: 'discipline-a', name: 'Zumba' }],
    });
    expect(await sessionsResponse.json()).toEqual({ sessions: [{ id: 'session-a' }] });
    expect(await bookingsResponse.json()).toEqual({ bookings: [{ id: 'booking-a' }] });
    expect(mocks.listGroupSessions).toHaveBeenCalledWith('client-a', 'discipline-a');
    expect(mocks.listOwnUpcomingBookings).toHaveBeenCalledWith('client-a');
  });

  it.each(['client-b', 'unknown-client'])(
    'rejects foreign clientId %s without querying or confirming it',
    async (clientId) => {
      const responses = await Promise.all([
        getSessions(
          request(`/api/group-sessions?disciplineId=discipline-a&clientId=${clientId}`),
        ),
        getOwnBookings(request(`/api/bookings?clientId=${clientId}`)),
        getOwnBooking(request(`/api/group-sessions/session-a/my-booking?clientId=${clientId}`), 'GET', undefined),
        postBooking(
          request('/api/group-sessions/session-a/bookings', 'POST', { clientId }),
          { params: Promise.resolve({ groupSessionId: 'session-a' }) },
        ),
      ]);

      for (const response of responses) {
        expect(response.status).toBe(403);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(await response.json()).toEqual({ error: 'UNAUTHORIZED' });
      }
      expect(mocks.listGroupSessions).not.toHaveBeenCalled();
      expect(mocks.listOwnUpcomingBookings).not.toHaveBeenCalled();
      expect(mocks.getOwnBookingForSession).not.toHaveBeenCalled();
      expect(mocks.confirmGroupBooking).not.toHaveBeenCalled();
    },
  );

  it('requires a discipline and does not issue an unfiltered class query', async () => {
    const response = await getSessions(request('/api/group-sessions'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'DISCIPLINE_REQUIRED' });
    expect(mocks.listGroupSessions).not.toHaveBeenCalled();
  });

  it('returns details and reconciliation results only for the authenticated client', async () => {
    mocks.getGroupSession.mockResolvedValue({ id: 'session-a', isBookedByClient: false });
    mocks.getOwnBookingForSession.mockResolvedValue(null);

    const sessionResponse = await getSession(
      request('/api/group-sessions/session-a'),
      { params: Promise.resolve({ groupSessionId: 'session-a' }) },
    );
    const bookingResponse = await getOwnBooking(
      request('/api/group-sessions/session-a/my-booking'),
      { params: Promise.resolve({ groupSessionId: 'session-a' }) },
    );

    expect(await sessionResponse.json()).toEqual({
      session: { id: 'session-a', isBookedByClient: false },
    });
    expect(await bookingResponse.json()).toEqual({ booking: null });
    expect(mocks.getGroupSession).toHaveBeenCalledWith('client-a', 'session-a');
    expect(mocks.getOwnBookingForSession).toHaveBeenCalledWith('client-a', 'session-a');
  });

  it('returns 201 for a new reservation and 200 for an idempotent existing reservation', async () => {
    const booking = {
      id: 'booking-a',
      groupSessionId: 'session-a',
      status: 'ACTIVE',
    };
    mocks.confirmGroupBooking
      .mockResolvedValueOnce({ booking, created: true })
      .mockResolvedValueOnce({ booking, created: false });

    const params = { params: Promise.resolve({ groupSessionId: 'session-a' }) };
    const first = await postBooking(
      request('/api/group-sessions/session-a/bookings', 'POST', {}),
      params,
    );
    const repeated = await postBooking(
      request('/api/group-sessions/session-a/bookings', 'POST', { clientId: 'client-a' }),
      params,
    );

    expect(first.status).toBe(201);
    expect(repeated.status).toBe(200);
    expect(first.headers.get('Cache-Control')).toBe('no-store');
    expect(await first.json()).toEqual({ booking });
    expect(await repeated.json()).toEqual({ booking });
    expect(mocks.confirmGroupBooking).toHaveBeenNthCalledWith(1, context, 'session-a');
    expect(mocks.confirmGroupBooking).toHaveBeenNthCalledWith(2, context, 'session-a');
  });

  it('returns neutral no-store responses for missing or unauthorized sessions', async () => {
    mocks.resolveClientContext.mockRejectedValueOnce(
      new ClientContextError(401, 'UNAUTHENTICATED'),
    );
    const response = await getOwnBookings(request('/api/bookings'));

    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'UNAUTHORIZED' });
  });

  it('returns the agreed conflict code without converting unexpected failures', async () => {
    mocks.confirmGroupBooking.mockRejectedValueOnce(
      new (await import('../../../lib/group-booking-domain')).GroupBookingError(
        'CAPACITY_EXCEEDED',
      ),
    );
    const response = await postBooking(
      request('/api/group-sessions/session-a/bookings', 'POST', {}),
      { params: Promise.resolve({ groupSessionId: 'session-a' }) },
    );

    expect(response.status).toBe(409);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'CAPACITY_EXCEEDED' });
  });

  it('rejects invalid JSON bodies without invoking the reservation use case', async () => {
    const malformed = new NextRequest(
      'https://api.example.test/api/group-sessions/session-a/bookings',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      },
    );

    const response = await postBooking(malformed, {
      params: Promise.resolve({ groupSessionId: 'session-a' }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'INVALID_JSON' });
    expect(mocks.confirmGroupBooking).not.toHaveBeenCalled();
  });
});
