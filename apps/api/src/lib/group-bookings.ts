import { Prisma, type GroupSession, type PrismaClient } from '@prisma/client';
import { ClientContextError, type ClientAuthContext } from './client-context';
import { prisma } from './prisma';
import {
  addCalendarDays,
  GroupBookingError,
  isWithinBookingWindow,
  madridDateKey,
  madridDateTimeToInstant,
  madridWeekday,
  occurrenceReference,
  parseOccurrenceReference,
  validateBookingWindow,
} from './group-booking-domain';

const SESSION_DETAILS = {
  discipline: { select: { id: true, name: true, status: true } },
  monitor: { select: { firstName: true, lastNames: true, status: true } },
  room: { select: { name: true, status: true } },
  groupSchedule: { select: { status: true } },
} satisfies Prisma.GroupSessionInclude;

const REVISION_DETAILS = {
  discipline: { select: { id: true, name: true, status: true } },
  monitor: { select: { firstName: true, lastNames: true, status: true } },
  room: { select: { name: true, status: true } },
  groupSchedule: { select: { status: true } },
} satisfies Prisma.GroupScheduleRevisionInclude;

type MaterializedSession = Prisma.GroupSessionGetPayload<{
  include: typeof SESSION_DETAILS;
}>;
type ScheduleRevision = Prisma.GroupScheduleRevisionGetPayload<{
  include: typeof REVISION_DETAILS;
}>;
type Database = PrismaClient | Prisma.TransactionClient;

export interface GroupSessionView {
  id: string;
  disciplineId: string;
  discipline: string;
  date: string;
  startsAt: string;
  endsAt: string;
  time: string;
  durationMinutes: 45;
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

export interface BookingConfirmation {
  id: string;
  groupSessionId: string;
  bookedAt: string;
  startsAt: string;
  status: 'ACTIVE';
}

interface SessionSnapshot {
  id: string;
  groupScheduleId: string;
  occurrenceDate: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  activeBookingCount: number;
  status: 'SCHEDULED' | 'CANCELLED';
  isScheduleActive: boolean;
  disciplineId: string;
  discipline: string;
  disciplineActive: boolean;
  monitor: string;
  monitorActive: boolean;
  room: string;
}

function dbDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date): string {
  const parts = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = new Map(parts.map(({ type, value }) => [type, value]));
  return `${values.get('hour')}:${values.get('minute')}`;
}

function localTime(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function sessionSnapshot(session: MaterializedSession): SessionSnapshot {
  return {
    id: session.id,
    groupScheduleId: session.groupScheduleId,
    occurrenceDate: dateKey(session.occurrenceDate),
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    activeBookingCount: session.activeBookingCount,
    status: session.status,
    isScheduleActive: session.groupSchedule.status === 'ACTIVE',
    disciplineId: session.disciplineId,
    discipline: session.discipline.name,
    disciplineActive: session.discipline.status === 'ACTIVE',
    monitor: `${session.monitor.firstName} ${session.monitor.lastNames}`,
    monitorActive: session.monitor.status === 'ACTIVE',
    room: session.room.name,
  };
}

function revisionSnapshot(revision: ScheduleRevision, date: string): SessionSnapshot {
  const startsAt = madridDateTimeToInstant(date, revision.localStartTime);

  return {
    id: occurrenceReference(revision.groupScheduleId, date),
    groupScheduleId: revision.groupScheduleId,
    occurrenceDate: date,
    startsAt,
    endsAt: new Date(startsAt.getTime() + 45 * 60 * 1000),
    capacity: revision.capacity,
    activeBookingCount: 0,
    status: 'SCHEDULED',
    isScheduleActive: revision.groupSchedule.status === 'ACTIVE',
    disciplineId: revision.disciplineId,
    discipline: revision.discipline.name,
    disciplineActive: revision.discipline.status === 'ACTIVE',
    monitor: `${revision.monitor.firstName} ${revision.monitor.lastNames}`,
    monitorActive: revision.monitor.status === 'ACTIVE',
    room: revision.room.name,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function materializeSession(
  transaction: Prisma.TransactionClient,
  reference: string,
): Promise<MaterializedSession | null> {
  if (isUuid(reference)) {
    return transaction.groupSession.findUnique({
      where: { id: reference },
      include: SESSION_DETAILS,
    });
  }

  const occurrence = parseOccurrenceReference(reference);
  if (!occurrence) {
    return null;
  }

  const occurrenceDate = dbDate(occurrence.dateKey);
  const existing = await transaction.groupSession.findUnique({
    where: {
      groupScheduleId_occurrenceDate: {
        groupScheduleId: occurrence.groupScheduleId,
        occurrenceDate,
      },
    },
    include: SESSION_DETAILS,
  });
  if (existing) {
    return existing;
  }

  const revision = await transaction.groupScheduleRevision.findFirst({
    where: {
      groupScheduleId: occurrence.groupScheduleId,
      weekday: madridWeekday(occurrence.dateKey),
      effectiveFrom: { lte: occurrenceDate },
      OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: occurrenceDate } }],
      groupSchedule: { status: 'ACTIVE' },
    },
    include: REVISION_DETAILS,
    orderBy: { effectiveFrom: 'desc' },
  });
  if (!revision) {
    return null;
  }

  const startsAt = madridDateTimeToInstant(occurrence.dateKey, revision.localStartTime);
  return transaction.groupSession.upsert({
    where: {
      groupScheduleId_occurrenceDate: {
        groupScheduleId: occurrence.groupScheduleId,
        occurrenceDate,
      },
    },
    update: {},
    create: {
      groupScheduleId: revision.groupScheduleId,
      scheduleRevisionId: revision.id,
      disciplineId: revision.disciplineId,
      monitorId: revision.monitorId,
      roomId: revision.roomId,
      occurrenceDate,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 45 * 60 * 1000),
      capacity: revision.capacity,
    },
    include: SESSION_DETAILS,
  });
}

function toView(
  session: SessionSnapshot,
  bookingId: string | undefined,
  hasConflict: boolean,
  now: Date,
): GroupSessionView {
  const availableSpots = Math.max(0, session.capacity - session.activeBookingCount);
  let availability: GroupSessionView['availability'];

  if (session.status !== 'SCHEDULED' || !session.isScheduleActive || !session.disciplineActive || !session.monitorActive) {
    availability = 'UNAVAILABLE';
  } else if (bookingId) {
    availability = 'BOOKED';
  } else if (!isWithinBookingWindow(now, session.startsAt)) {
    availability = 'WINDOW_CLOSED';
  } else if (hasConflict) {
    availability = 'CONFLICT';
  } else if (availableSpots === 0) {
    availability = 'FULL';
  } else {
    availability = 'AVAILABLE';
  }

  return {
    id: session.id,
    disciplineId: session.disciplineId,
    discipline: session.discipline,
    date: session.occurrenceDate,
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    time: formatTime(session.startsAt),
    durationMinutes: 45,
    monitor: session.monitor,
    room: session.room,
    capacity: session.capacity,
    availableSpots,
    status: session.status,
    isBookedByClient: Boolean(bookingId),
    hasConflict,
    availability,
    reservable: availability === 'AVAILABLE',
  };
}

async function addClientState(
  database: Database,
  sessions: SessionSnapshot[],
  clientId: string,
  now: Date,
): Promise<GroupSessionView[]> {
  if (sessions.length === 0) {
    return [];
  }

  const firstStart = Math.min(...sessions.map(({ startsAt }) => startsAt.getTime()));
  const lastEnd = Math.max(...sessions.map(({ endsAt }) => endsAt.getTime()));
  const materializedIds = sessions.filter(({ id }) => isUuid(id)).map(({ id }) => id);
  const [bookings, occupancies, privateSessions] = await Promise.all([
    materializedIds.length > 0
      ? database.groupBooking.findMany({
          where: {
            clientId,
            status: 'ACTIVE',
            groupSessionId: { in: materializedIds },
          },
          select: { id: true, groupSessionId: true },
        })
      : Promise.resolve([]),
    database.scheduleOccupancy.findMany({
      where: {
        clientId,
        active: true,
        startsAt: { lt: new Date(lastEnd) },
        endsAt: { gt: new Date(firstStart) },
      },
      select: { groupBookingId: true, startsAt: true, endsAt: true },
    }),
    database.privateSession.findMany({
      where: {
        clientId,
        status: 'CONFIRMED',
        startsAt: { lt: new Date(lastEnd) },
        endsAt: { gt: new Date(firstStart) },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);
  const bookingBySession = new Map(bookings.map((booking) => [booking.groupSessionId, booking.id]));

  return sessions.map((session) => {
    const ownBookingId = bookingBySession.get(session.id);
    const hasConflict =
      occupancies.some(
        (occupancy) =>
          occupancy.groupBookingId !== ownBookingId &&
          occupancy.startsAt < session.endsAt &&
          occupancy.endsAt > session.startsAt,
      ) ||
      privateSessions.some(
        (privateSession) =>
          privateSession.startsAt < session.endsAt &&
          privateSession.endsAt > session.startsAt,
      );

    return toView(session, ownBookingId, hasConflict, now);
  });
}

export async function listDisciplines(): Promise<Array<{ id: string; name: string }>> {
  return prisma.discipline.findMany({
    where: {
      status: 'ACTIVE',
      scheduleRevisions: { some: { groupSchedule: { status: 'ACTIVE' } } },
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function listGroupSessions(
  clientId: string,
  disciplineId: string,
  now = new Date(),
): Promise<GroupSessionView[]> {
  const horizonEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const firstDate = madridDateKey(now);
  const lastDate = madridDateKey(horizonEnd);
  const dateKeys: string[] = [];
  for (let date = firstDate; date <= lastDate; date = addCalendarDays(date, 1)) {
    dateKeys.push(date);
  }
  const weekdays = [...new Set(dateKeys.map(madridWeekday))];
  const [materializedSessions, revisions] = await Promise.all([
    prisma.groupSession.findMany({
      where: {
        occurrenceDate: { gte: dbDate(firstDate), lte: dbDate(lastDate) },
        disciplineId,
      },
      include: SESSION_DETAILS,
    }),
    prisma.groupScheduleRevision.findMany({
      where: {
        disciplineId,
        weekday: { in: weekdays },
        effectiveFrom: { lte: dbDate(lastDate) },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: dbDate(firstDate) } }],
        groupSchedule: { status: 'ACTIVE' },
        discipline: { status: 'ACTIVE' },
      },
      include: REVISION_DETAILS,
    }),
  ]);
  const sessionsByOccurrence = new Map<string, SessionSnapshot>();

  for (const revision of revisions) {
    if (revision.groupSchedule.status !== 'ACTIVE') {
      continue;
    }

    for (const date of dateKeys) {
      const occurrenceDate = dbDate(date);
      if (
        revision.weekday !== madridWeekday(date) ||
        revision.effectiveFrom > occurrenceDate ||
        (revision.effectiveUntil && revision.effectiveUntil < occurrenceDate)
      ) {
        continue;
      }

      const session = revisionSnapshot(revision, date);
      sessionsByOccurrence.set(`${session.groupScheduleId}:${date}`, session);
    }
  }

  for (const materialized of materializedSessions) {
    const session = sessionSnapshot(materialized);
    sessionsByOccurrence.set(`${session.groupScheduleId}:${session.occurrenceDate}`, session);
  }

  const upcomingSessions = [...sessionsByOccurrence.values()]
    .filter(
      (session) =>
        session.startsAt >= now &&
        session.startsAt <= horizonEnd &&
        session.status === 'SCHEDULED',
    )
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());

  return addClientState(prisma, upcomingSessions, clientId, now);
}

async function findSessionForDetail(
  reference: string,
  now: Date,
): Promise<SessionSnapshot | null> {
  if (isUuid(reference)) {
    const session = await prisma.groupSession.findUnique({
      where: { id: reference },
      include: SESSION_DETAILS,
    });
    if (!session || session.startsAt < now || session.startsAt.getTime() > now.getTime() + 72 * 60 * 60 * 1000) {
      return null;
    }
    return sessionSnapshot(session);
  }

  const occurrence = parseOccurrenceReference(reference);
  if (!occurrence) {
    return null;
  }

  const occurrenceDate = dbDate(occurrence.dateKey);
  const materialized = await prisma.groupSession.findUnique({
    where: {
      groupScheduleId_occurrenceDate: {
        groupScheduleId: occurrence.groupScheduleId,
        occurrenceDate,
      },
    },
    include: SESSION_DETAILS,
  });
  if (materialized) {
    const session = sessionSnapshot(materialized);
    return session.startsAt >= now && session.startsAt.getTime() <= now.getTime() + 72 * 60 * 60 * 1000
      ? session
      : null;
  }

  const revision = await prisma.groupScheduleRevision.findFirst({
    where: {
      groupScheduleId: occurrence.groupScheduleId,
      weekday: madridWeekday(occurrence.dateKey),
      effectiveFrom: { lte: occurrenceDate },
      OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: occurrenceDate } }],
      groupSchedule: { status: 'ACTIVE' },
      discipline: { status: 'ACTIVE' },
    },
    include: REVISION_DETAILS,
    orderBy: { effectiveFrom: 'desc' },
  });
  if (!revision || revision.groupSchedule.status !== 'ACTIVE') {
    return null;
  }

  const session = revisionSnapshot(revision, occurrence.dateKey);
  return session.startsAt >= now && session.startsAt.getTime() <= now.getTime() + 72 * 60 * 60 * 1000
    ? session
    : null;
}

export async function getGroupSession(
  clientId: string,
  reference: string,
  now = new Date(),
): Promise<GroupSessionView | null> {
  const session = await findSessionForDetail(reference, now);
  if (!session) {
    return null;
  }

  const [view] = await addClientState(prisma, [session], clientId, now);
  return view;
}

export interface OwnBookingListItem {
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

export async function listOwnUpcomingBookings(
  clientId: string,
  now = new Date(),
): Promise<OwnBookingListItem[]> {
  const [groupBookings, privateSessions] = await Promise.all([
    prisma.groupBooking.findMany({
      where: {
        clientId,
        status: 'ACTIVE',
        groupSession: { status: 'SCHEDULED', startsAt: { gt: now } },
      },
      include: {
        groupSession: {
          include: SESSION_DETAILS,
        },
      },
    }),
    prisma.privateSession.findMany({
      where: { clientId, status: 'CONFIRMED', startsAt: { gt: now } },
      include: { monitor: { select: { firstName: true, lastNames: true } } },
    }),
  ]);

  return [
    ...groupBookings.map((booking) => ({
      id: booking.id,
      type: 'GROUP' as const,
      startsAt: booking.groupSession.startsAt.toISOString(),
      endsAt: booking.groupSession.endsAt.toISOString(),
      date: dateKey(booking.groupSession.occurrenceDate),
      time: formatTime(booking.groupSession.startsAt),
      discipline: booking.groupSession.discipline.name,
      monitor: `${booking.groupSession.monitor.firstName} ${booking.groupSession.monitor.lastNames}`,
      room: booking.groupSession.room.name,
      status: 'ACTIVE' as const,
    })),
    ...privateSessions.map((session) => ({
      id: session.id,
      type: 'PRIVATE' as const,
      startsAt: session.startsAt.toISOString(),
      endsAt: session.endsAt.toISOString(),
      date: madridDateKey(session.startsAt),
      time: formatTime(session.startsAt),
      monitor: `${session.monitor.firstName} ${session.monitor.lastNames}`,
      status: 'CONFIRMED' as const,
    })),
  ].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

export async function getOwnBookingForSession(
  clientId: string,
  reference: string,
): Promise<BookingConfirmation | null> {
  let groupSessionId: string | undefined;

  if (isUuid(reference)) {
    groupSessionId = reference;
  } else {
    const occurrence = parseOccurrenceReference(reference);
    if (!occurrence) {
      return null;
    }
    const session = await prisma.groupSession.findUnique({
      where: {
        groupScheduleId_occurrenceDate: {
          groupScheduleId: occurrence.groupScheduleId,
          occurrenceDate: dbDate(occurrence.dateKey),
        },
      },
      select: { id: true },
    });
    groupSessionId = session?.id;
  }

  if (!groupSessionId) {
    return null;
  }

  const booking = await prisma.groupBooking.findFirst({
    where: { clientId, groupSessionId, status: 'ACTIVE' },
    include: { groupSession: { select: { startsAt: true } } },
  });
  return booking ? confirmation(booking) : null;
}

function confirmation(booking: {
  id: string;
  groupSessionId: string;
  bookedAt: Date;
  groupSession: { startsAt: Date };
}): BookingConfirmation {
  return {
    id: booking.id,
    groupSessionId: booking.groupSessionId,
    bookedAt: booking.bookedAt.toISOString(),
    startsAt: booking.groupSession.startsAt.toISOString(),
    status: 'ACTIVE',
  };
}

async function assertActiveContext(
  transaction: Prisma.TransactionClient,
  context: ClientAuthContext,
): Promise<void> {
  const accounts = await transaction.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "user_account"
    WHERE "id" = ${context.userAccountId}::uuid
      AND "role" = 'CLIENT'
      AND "status" = 'ACTIVE'
    FOR SHARE
  `;
  const clients = await transaction.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "client"
    WHERE "id" = ${context.clientId}::uuid
      AND "user_account_id" = ${context.userAccountId}::uuid
      AND "status" = 'ACTIVE'
    FOR SHARE
  `;

  if (accounts.length !== 1 || clients.length !== 1) {
    throw new ClientContextError(403, 'UNAUTHORIZED');
  }
}

async function existingBooking(
  transaction: Prisma.TransactionClient,
  groupSessionId: string,
  clientId: string,
) {
  return transaction.groupBooking.findFirst({
    where: { groupSessionId, clientId, status: 'ACTIVE' },
    include: { groupSession: { select: { startsAt: true } } },
  });
}

async function hasClientConflict(
  transaction: Prisma.TransactionClient,
  session: GroupSession,
  clientId: string,
): Promise<boolean> {
  const [occupancy, groupBooking, privateSession] = await Promise.all([
    transaction.scheduleOccupancy.findFirst({
      where: {
        clientId,
        active: true,
        startsAt: { lt: session.endsAt },
        endsAt: { gt: session.startsAt },
      },
      select: { id: true },
    }),
    transaction.groupBooking.findFirst({
      where: {
        clientId,
        status: 'ACTIVE',
        groupSessionId: { not: session.id },
        groupSession: {
          startsAt: { lt: session.endsAt },
          endsAt: { gt: session.startsAt },
        },
      },
      select: { id: true },
    }),
    transaction.privateSession.findFirst({
      where: {
        clientId,
        status: 'CONFIRMED',
        startsAt: { lt: session.endsAt },
        endsAt: { gt: session.startsAt },
      },
      select: { id: true },
    }),
  ]);

  return Boolean(occupancy || groupBooking || privateSession);
}

function mapDatabaseConstraintError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2004' &&
    (JSON.stringify(error.meta) ?? '').includes('23P01')
  ) {
    throw new GroupBookingError('BOOKING_CONFLICT');
  }
  throw error;
}

export async function confirmGroupBooking(
  context: ClientAuthContext,
  reference: string,
  now = new Date(),
): Promise<{ booking: BookingConfirmation; created: boolean }> {
  let attemptedSessionId: string | undefined;
  try {
    return await prisma.$transaction(async (transaction) => {
      await assertActiveContext(transaction, context);

      const session = await materializeSession(transaction, reference);
      if (!session) {
        throw new GroupBookingError('SESSION_UNAVAILABLE');
      }
      attemptedSessionId = session.id;

      const existing = await existingBooking(transaction, session.id, context.clientId);
      if (existing) {
        await assertActiveContext(transaction, context);
        return { booking: confirmation(existing), created: false };
      }

      if (
        session.status !== 'SCHEDULED' ||
        session.groupSchedule.status !== 'ACTIVE' ||
        session.discipline.status !== 'ACTIVE' ||
        session.monitor.status !== 'ACTIVE'
      ) {
        throw new GroupBookingError('SESSION_UNAVAILABLE');
      }

      validateBookingWindow(now, session.startsAt);
      if (await hasClientConflict(transaction, session, context.clientId)) {
        throw new GroupBookingError('BOOKING_CONFLICT');
      }

      const updated = await transaction.$queryRaw<Array<{ id: string }>>`
        UPDATE "group_session"
        SET "active_booking_count" = "active_booking_count" + 1,
            "updated_at" = CURRENT_TIMESTAMP
        WHERE "id" = ${session.id}::uuid
          AND "status" = 'SCHEDULED'
          AND "active_booking_count" < "capacity"
        RETURNING "id"
      `;

      if (updated.length !== 1) {
        const duplicate = await existingBooking(transaction, session.id, context.clientId);
        if (duplicate) {
          await assertActiveContext(transaction, context);
          return { booking: confirmation(duplicate), created: false };
        }

        const currentSession = await transaction.groupSession.findUnique({
          where: { id: session.id },
        });
        if (!currentSession || currentSession.status !== 'SCHEDULED') {
          throw new GroupBookingError('SESSION_UNAVAILABLE');
        }
        validateBookingWindow(now, currentSession.startsAt);
        if (currentSession.activeBookingCount >= currentSession.capacity) {
          throw new GroupBookingError('CAPACITY_EXCEEDED');
        }
        throw new GroupBookingError('SESSION_UNAVAILABLE');
      }

      const booking = await transaction.groupBooking.create({
        data: {
          groupSessionId: session.id,
          clientId: context.clientId,
          bookedByUserId: context.userAccountId,
        },
        include: { groupSession: { select: { startsAt: true } } },
      });
      await transaction.scheduleOccupancy.create({
        data: {
          clientId: context.clientId,
          groupBookingId: booking.id,
          startsAt: session.startsAt,
          endsAt: session.endsAt,
        },
      });

      await assertActiveContext(transaction, context);
      return { booking: confirmation(booking), created: true };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const duplicate = attemptedSessionId
        ? await prisma.groupBooking.findFirst({
            where: {
              clientId: context.clientId,
              groupSessionId: attemptedSessionId,
              status: 'ACTIVE',
            },
            include: { groupSession: { select: { startsAt: true } } },
          })
        : null;
      if (duplicate) {
        await prisma.$transaction((transaction) => assertActiveContext(transaction, context));
        return { booking: confirmation(duplicate), created: false };
      }
    }

    mapDatabaseConstraintError(error);
  }
}
