import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  ClientContextError,
  type ClientAuthContext,
} from '../src/lib/client-context';
import {
  addCalendarDays,
  GroupBookingError,
  madridDateKey,
  madridDateTimeToInstant,
  madridWeekday,
  occurrenceReference,
} from '../src/lib/group-booking-domain';
import {
  confirmGroupBooking,
  getGroupSession,
  getOwnBookingForSession,
  listGroupSessions,
  listOwnUpcomingBookings,
} from '../src/lib/group-bookings';
import { prisma } from '../src/lib/prisma';

if (
  !process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL
) {
  throw new Error('Run this suite using pnpm test:api:integration and an isolated test database.');
}

const created = {
  accountIds: [] as string[],
  clientIds: [] as string[],
  disciplineIds: [] as string[],
  monitorIds: [] as string[],
  roomIds: [] as string[],
  scheduleIds: [] as string[],
  revisionIds: [] as string[],
  sessionIds: [] as string[],
};

interface ClientFixture {
  context: ClientAuthContext;
  clientId: string;
  userAccountId: string;
}

interface ClassFixture {
  disciplineId: string;
  groupScheduleId: string;
  monitorId: string;
  roomId: string;
  scheduleRevisionId: string;
  sessionId?: string;
  startsAt: Date;
}

const localStartTime = new Date('1970-01-01T08:00:00.000Z');
const databaseTestTimeout = 60_000;

async function createClient(): Promise<ClientFixture> {
  const account = await prisma.userAccount.create({
    data: { role: 'CLIENT', status: 'ACTIVE' },
  });
  created.accountIds.push(account.id);
  const client = await prisma.client.create({
    data: {
      userAccountId: account.id,
      firstName: 'Integration',
      lastNames: randomUUID(),
      status: 'ACTIVE',
    },
  });
  created.clientIds.push(client.id);
  await prisma.authIdentity.create({
    data: {
      userAccountId: account.id,
      provider: 'MOCK',
      externalSubject: `integration|${randomUUID()}`,
    },
  });

  return {
    userAccountId: account.id,
    clientId: client.id,
    context: {
      userAccountId: account.id,
      clientId: client.id,
      subject: `integration|${randomUUID()}`,
    },
  };
}

async function createClass(capacity = 4, materialized = true): Promise<ClassFixture> {
  const discipline = await prisma.discipline.create({
    data: { name: `Integration ${randomUUID()}`, status: 'ACTIVE' },
  });
  created.disciplineIds.push(discipline.id);
  const monitor = await prisma.monitor.create({
    data: { firstName: 'Test', lastNames: randomUUID(), status: 'ACTIVE' },
  });
  created.monitorIds.push(monitor.id);
  const room = await prisma.room.create({
    data: { name: `Room ${randomUUID()}`, status: 'ACTIVE' },
  });
  created.roomIds.push(room.id);
  const schedule = await prisma.groupSchedule.create({ data: { status: 'ACTIVE' } });
  created.scheduleIds.push(schedule.id);
  const startsAt = madridDateTimeToInstant(
    madridDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    localStartTime,
  );
  const occurrenceDate = new Date(`${madridDateKey(startsAt)}T00:00:00.000Z`);
  const revision = await prisma.groupScheduleRevision.create({
    data: {
      groupScheduleId: schedule.id,
      disciplineId: discipline.id,
      monitorId: monitor.id,
      roomId: room.id,
      weekday: madridWeekday(madridDateKey(startsAt)),
      localStartTime,
      capacity,
      effectiveFrom: occurrenceDate,
    },
  });
  created.revisionIds.push(revision.id);

  if (!materialized) {
    return {
      disciplineId: discipline.id,
      groupScheduleId: schedule.id,
      monitorId: monitor.id,
      roomId: room.id,
      scheduleRevisionId: revision.id,
      startsAt,
    };
  }

  const session = await prisma.groupSession.create({
    data: {
      groupScheduleId: schedule.id,
      scheduleRevisionId: revision.id,
      disciplineId: discipline.id,
      monitorId: monitor.id,
      roomId: room.id,
      occurrenceDate,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 45 * 60 * 1000),
      capacity,
      status: 'SCHEDULED',
    },
  });
  created.sessionIds.push(session.id);

  return {
    disciplineId: discipline.id,
    groupScheduleId: schedule.id,
    monitorId: monitor.id,
    roomId: room.id,
    scheduleRevisionId: revision.id,
    sessionId: session.id,
    startsAt,
  };
}

async function removeCreatedRows(): Promise<void> {
  if (created.clientIds.length > 0) {
    await prisma.scheduleOccupancy.deleteMany({
      where: { clientId: { in: created.clientIds } },
    });
    await prisma.privateSession.deleteMany({
      where: { clientId: { in: created.clientIds } },
    });
    await prisma.groupBooking.deleteMany({
      where: { clientId: { in: created.clientIds } },
    });
  }
  if (created.sessionIds.length > 0) {
    await prisma.groupBooking.deleteMany({
      where: { groupSessionId: { in: created.sessionIds } },
    });
    await prisma.groupSession.deleteMany({ where: { id: { in: created.sessionIds } } });
  }
  if (created.revisionIds.length > 0) {
    await prisma.groupScheduleRevision.deleteMany({
      where: { id: { in: created.revisionIds } },
    });
  }
  if (created.scheduleIds.length > 0) {
    await prisma.groupSchedule.deleteMany({ where: { id: { in: created.scheduleIds } } });
  }
  if (created.clientIds.length > 0) {
    await prisma.client.deleteMany({ where: { id: { in: created.clientIds } } });
  }
  if (created.accountIds.length > 0) {
    await prisma.authIdentity.deleteMany({
      where: { userAccountId: { in: created.accountIds } },
    });
    await prisma.userAccount.deleteMany({ where: { id: { in: created.accountIds } } });
  }
  if (created.disciplineIds.length > 0) {
    await prisma.discipline.deleteMany({ where: { id: { in: created.disciplineIds } } });
  }
  if (created.monitorIds.length > 0) {
    await prisma.monitor.deleteMany({ where: { id: { in: created.monitorIds } } });
  }
  if (created.roomIds.length > 0) {
    await prisma.room.deleteMany({ where: { id: { in: created.roomIds } } });
  }

  for (const ids of Object.values(created)) {
    ids.length = 0;
  }
}

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(removeCreatedRows, databaseTestTimeout);

afterAll(async () => {
  await prisma.$disconnect();
}, databaseTestTimeout);

describe('group booking PostgreSQL integration', () => {
  it('creates one active booking, returns repeats before window/full checks and protects partial uniqueness', async () => {
    const client = await createClient();
    const groupClass = await createClass(1);
    const sessionId = groupClass.sessionId!;
    const first = await confirmGroupBooking(
      client.context,
      sessionId,
      new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000),
    );
    const repeated = await confirmGroupBooking(
      client.context,
      sessionId,
      new Date(groupClass.startsAt.getTime() + 60 * 60 * 1000),
    );
    const closedWindowRepeat = await confirmGroupBooking(
      client.context,
      sessionId,
      new Date(groupClass.startsAt.getTime() - 2 * 60 * 60 * 1000),
    );

    expect(first.created).toBe(true);
    expect(repeated.created).toBe(false);
    expect(closedWindowRepeat.created).toBe(false);
    expect(repeated.booking.id).toBe(first.booking.id);
    expect(closedWindowRepeat.booking.id).toBe(first.booking.id);
    await expect(
      prisma.groupBooking.create({
        data: {
          groupSessionId: sessionId,
          clientId: client.clientId,
          bookedByUserId: client.userAccountId,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    const [session, bookingCount, occupancyCount] = await Promise.all([
      prisma.groupSession.findUniqueOrThrow({ where: { id: sessionId } }),
      prisma.groupBooking.count({
        where: { groupSessionId: sessionId, clientId: client.clientId, status: 'ACTIVE' },
      }),
      prisma.scheduleOccupancy.count({
        where: { groupBookingId: first.booking.id, active: true },
      }),
    ]);
    expect(session.activeBookingCount).toBe(1);
    expect(bookingCount).toBe(1);
    expect(occupancyCount).toBe(1);
  }, databaseTestTimeout);

  it('allows only one client to acquire the last spot under concurrent requests', async () => {
    const firstClient = await createClient();
    const secondClient = await createClient();
    const groupClass = await createClass(1);
    const now = new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000);

    const results = await Promise.allSettled([
      confirmGroupBooking(firstClient.context, groupClass.sessionId!, now),
      confirmGroupBooking(secondClient.context, groupClass.sessionId!, now),
    ]);
    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    const [session, activeBookings, occupancies] = await Promise.all([
      prisma.groupSession.findUniqueOrThrow({ where: { id: groupClass.sessionId } }),
      prisma.groupBooking.count({
        where: { groupSessionId: groupClass.sessionId, status: 'ACTIVE' },
      }),
      prisma.scheduleOccupancy.count({
        where: { active: true, groupBooking: { groupSessionId: groupClass.sessionId } },
      }),
    ]);

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(GroupBookingError);
    expect(rejected[0].reason.code).toBe('CAPACITY_EXCEEDED');
    expect(session.activeBookingCount).toBe(1);
    expect(activeBookings).toBe(1);
    expect(occupancies).toBe(1);
  }, databaseTestTimeout);

  it('resolves concurrent retries for one client to the same active booking', async () => {
    const client = await createClient();
    const groupClass = await createClass(4);
    const now = new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000);

    const results = await Promise.all([
      confirmGroupBooking(client.context, groupClass.sessionId!, now),
      confirmGroupBooking(client.context, groupClass.sessionId!, now),
    ]);
    const [session, bookingCount, occupancyCount] = await Promise.all([
      prisma.groupSession.findUniqueOrThrow({ where: { id: groupClass.sessionId } }),
      prisma.groupBooking.count({
        where: {
          groupSessionId: groupClass.sessionId,
          clientId: client.clientId,
          status: 'ACTIVE',
        },
      }),
      prisma.scheduleOccupancy.count({
        where: { clientId: client.clientId, active: true },
      }),
    ]);

    expect(results.map(({ created }) => created).sort()).toEqual([false, true]);
    expect(results[0].booking.id).toBe(results[1].booking.id);
    expect(session.activeBookingCount).toBe(1);
    expect(bookingCount).toBe(1);
    expect(occupancyCount).toBe(1);
  }, databaseTestTimeout);

  it('isolates upcoming and reconciled bookings between clients and combines private sessions chronologically', async () => {
    const firstClient = await createClient();
    const secondClient = await createClient();
    const groupClass = await createClass(3);
    const sessionId = groupClass.sessionId!;
    const now = new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000);
    await confirmGroupBooking(firstClient.context, sessionId, now);
    await prisma.privateSession.create({
      data: {
        clientId: firstClient.clientId,
        monitorId: groupClass.monitorId,
        bookedByUserId: firstClient.userAccountId,
        startsAt: new Date(groupClass.startsAt.getTime() - 60 * 60 * 1000),
        endsAt: new Date(groupClass.startsAt.getTime() - 15 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const [firstBookings, secondBookings, ownBooking, foreignBooking] = await Promise.all([
      listOwnUpcomingBookings(firstClient.clientId),
      listOwnUpcomingBookings(secondClient.clientId),
      getOwnBookingForSession(firstClient.clientId, sessionId),
      getOwnBookingForSession(secondClient.clientId, sessionId),
    ]);

    expect(firstBookings.map(({ type }) => type)).toEqual(['PRIVATE', 'GROUP']);
    expect(secondBookings).toEqual([]);
    expect(ownBooking?.id).toBeDefined();
    expect(foreignBooking).toBeNull();
  }, databaseTestTimeout);

  it('selects materialized occurrences over calculated ones and resolves unmaterialized details', async () => {
    const client = await createClient();
    const otherClient = await createClient();
    const materialized = await createClass(4);
    const calculated = await createClass(5, false);
    const now = new Date(materialized.startsAt.getTime() - 24 * 60 * 60 * 1000);
    await prisma.privateSession.create({
      data: {
        clientId: client.clientId,
        monitorId: materialized.monitorId,
        bookedByUserId: client.userAccountId,
        startsAt: materialized.startsAt,
        endsAt: new Date(materialized.startsAt.getTime() + 45 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });

    const materializedResults = await listGroupSessions(
      client.clientId,
      materialized.disciplineId,
      now,
    );
    const otherClientResults = await listGroupSessions(
      otherClient.clientId,
      materialized.disciplineId,
      now,
    );
    const calculatedResults = await listGroupSessions(
      client.clientId,
      calculated.disciplineId,
      now,
    );
    const reference = occurrenceReference(
      calculated.groupScheduleId,
      madridDateKey(calculated.startsAt),
    );
    const detail = await getGroupSession(client.clientId, reference, now);

    expect(materializedResults).toHaveLength(1);
    expect(materializedResults[0].id).toBe(materialized.sessionId);
    expect(materializedResults[0].availability).toBe('CONFLICT');
    expect(otherClientResults[0].availability).toBe('AVAILABLE');
    expect(calculatedResults).toHaveLength(1);
    expect(calculatedResults[0].id).toBe(reference);
    expect(detail?.id).toBe(reference);
    expect(detail?.disciplineId).toBe(calculated.disciplineId);
  }, databaseTestTimeout);

  it('excludes past and cancelled group and private bookings from the upcoming list', async () => {
    const client = await createClient();
    const pastClass = await createClass(2);
    const futureClass = await createClass(2);
    const pastStartsAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await prisma.groupSession.update({
      where: { id: pastClass.sessionId },
      data: {
        startsAt: pastStartsAt,
        endsAt: new Date(pastStartsAt.getTime() + 45 * 60 * 1000),
      },
    });
    await confirmGroupBooking(
      client.context,
      pastClass.sessionId!,
      new Date(pastStartsAt.getTime() - 24 * 60 * 60 * 1000),
    );
    await prisma.groupBooking.create({
      data: {
        groupSessionId: futureClass.sessionId!,
        clientId: client.clientId,
        bookedByUserId: client.userAccountId,
        status: 'CANCELLED_BY_CLIENT',
      },
    });
    await prisma.privateSession.createMany({
      data: [
        {
          clientId: client.clientId,
          monitorId: pastClass.monitorId,
          bookedByUserId: client.userAccountId,
          startsAt: pastStartsAt,
          endsAt: new Date(pastStartsAt.getTime() + 45 * 60 * 1000),
          status: 'CONFIRMED',
        },
        {
          clientId: client.clientId,
          monitorId: futureClass.monitorId,
          bookedByUserId: client.userAccountId,
          startsAt: futureClass.startsAt,
          endsAt: new Date(futureClass.startsAt.getTime() + 45 * 60 * 1000),
          status: 'CANCELLED_BY_CLIENT',
        },
      ],
    });

    await expect(listOwnUpcomingBookings(client.clientId)).resolves.toEqual([]);
  }, databaseTestTimeout);

  it('rejects inactive accounts or clients and rolls back all booking effects', async () => {
    const groupClass = await createClass(2);
    const accountInactive = await createClient();
    await prisma.userAccount.update({
      where: { id: accountInactive.userAccountId },
      data: { status: 'INACTIVE' },
    });
    const clientInactive = await createClient();
    await prisma.client.update({
      where: { id: clientInactive.clientId },
      data: { status: 'INACTIVE' },
    });

    for (const client of [accountInactive, clientInactive]) {
      await expect(
        confirmGroupBooking(
          client.context,
          groupClass.sessionId!,
          new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000),
        ),
      ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
    }

    const [session, bookings, occupancies] = await Promise.all([
      prisma.groupSession.findUniqueOrThrow({ where: { id: groupClass.sessionId } }),
      prisma.groupBooking.count({ where: { groupSessionId: groupClass.sessionId } }),
      prisma.scheduleOccupancy.count({
        where: { clientId: { in: [accountInactive.clientId, clientInactive.clientId] } },
      }),
    ]);
    expect(session.activeBookingCount).toBe(0);
    expect(bookings).toBe(0);
    expect(occupancies).toBe(0);
  }, databaseTestTimeout);

  it('revalidates deactivation inside the transaction and rolls back counter, booking and occupancy', async () => {
    const client = await createClient();
    const groupClass = await createClass(2);
    const suffix = randomUUID().replaceAll('-', '');
    const functionName = `test_deactivate_${suffix}`;
    const triggerName = `test_deactivate_${suffix}`;

    await prisma.$executeRawUnsafe(`
      CREATE FUNCTION "${functionName}"() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE "user_account"
        SET "status" = 'INACTIVE'
        WHERE "id" = NEW."booked_by_user_id";
        RETURN NEW;
      END
      $$
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER "${triggerName}"
      BEFORE INSERT ON "group_booking"
      FOR EACH ROW EXECUTE FUNCTION "${functionName}"()
    `);

    try {
      await expect(
        confirmGroupBooking(
          client.context,
          groupClass.sessionId!,
          new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000),
        ),
      ).rejects.toMatchObject({
        status: 403,
        code: 'UNAUTHORIZED',
      } satisfies Partial<ClientContextError>);
    } finally {
      await prisma.$executeRawUnsafe(`DROP TRIGGER "${triggerName}" ON "group_booking"`);
      await prisma.$executeRawUnsafe(`DROP FUNCTION "${functionName}"()`);
    }

    const [account, session, bookings, occupancies] = await Promise.all([
      prisma.userAccount.findUniqueOrThrow({ where: { id: client.userAccountId } }),
      prisma.groupSession.findUniqueOrThrow({ where: { id: groupClass.sessionId } }),
      prisma.groupBooking.count({ where: { groupSessionId: groupClass.sessionId } }),
      prisma.scheduleOccupancy.count({ where: { clientId: client.clientId } }),
    ]);
    expect(account.status).toBe('ACTIVE');
    expect(session.activeBookingCount).toBe(0);
    expect(bookings).toBe(0);
    expect(occupancies).toBe(0);
  }, databaseTestTimeout);

  it('honors started and closed-window errors before capacity while keeping the count in range', async () => {
    const firstClient = await createClient();
    const secondClient = await createClient();
    const groupClass = await createClass(1);
    const sessionId = groupClass.sessionId!;

    await expect(
      confirmGroupBooking(firstClient.context, sessionId, groupClass.startsAt),
    ).rejects.toMatchObject({ code: 'SESSION_STARTED' });
    await expect(
      confirmGroupBooking(
        firstClient.context,
        sessionId,
        new Date(groupClass.startsAt.getTime() - 2 * 60 * 60 * 1000),
      ),
    ).rejects.toMatchObject({ code: 'BOOKING_WINDOW_CLOSED' });
    await confirmGroupBooking(
      firstClient.context,
      sessionId,
      new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000),
    );
    await expect(
      confirmGroupBooking(
        secondClient.context,
        sessionId,
        new Date(groupClass.startsAt.getTime() - 24 * 60 * 60 * 1000),
      ),
    ).rejects.toMatchObject({ code: 'CAPACITY_EXCEEDED' });

    await expect(
      prisma.groupSession.update({
        where: { id: sessionId },
        data: { activeBookingCount: 2 },
      }),
    ).rejects.toThrow('group_session_booking_count_check');
    const session = await prisma.groupSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    expect(session.activeBookingCount).toBe(1);
  }, databaseTestTimeout);
});
