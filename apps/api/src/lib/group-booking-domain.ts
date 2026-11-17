const BUSINESS_TIME_ZONE = 'Europe/Madrid';
const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const BOOKING_WINDOW_START_HOURS = 72;
const BOOKING_WINDOW_END_HOURS = 3;

export type BookingErrorCode =
  | 'SESSION_STARTED'
  | 'BOOKING_WINDOW_CLOSED'
  | 'CAPACITY_EXCEEDED'
  | 'SESSION_UNAVAILABLE'
  | 'BOOKING_CONFLICT';

export class GroupBookingError extends Error {
  constructor(public readonly code: BookingErrorCode) {
    super(code);
  }
}

export function madridDateKey(instant: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = new Map(parts.map(({ type, value }) => [type, value]));

  return `${values.get('year')}-${values.get('month')}-${values.get('day')}`;
}

export function addCalendarDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function madridWeekday(dateKey: string): number {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export function madridDateTimeToInstant(dateKey: string, time: Date): Date {
  const hours = time.getUTCHours();
  const minutes = time.getUTCMinutes();
  const seconds = time.getUTCSeconds();
  const targetUtc = Date.UTC(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(5, 7)) - 1,
    Number(dateKey.slice(8, 10)),
    hours,
    minutes,
    seconds,
  );
  let candidate = targetUtc;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: BUSINESS_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(candidate));
    const values = new Map(parts.map(({ type, value }) => [type, Number(value)]));
    const representedUtc = Date.UTC(
      values.get('year')!,
      values.get('month')! - 1,
      values.get('day')!,
      values.get('hour')!,
      values.get('minute')!,
      values.get('second')!,
    );
    const adjustment = targetUtc - representedUtc;

    candidate += adjustment;
    if (adjustment === 0) {
      break;
    }
  }

  return new Date(candidate);
}

export function isWithinBookingWindow(now: Date, startsAt: Date): boolean {
  const earliest = startsAt.getTime() - BOOKING_WINDOW_START_HOURS * HOUR_IN_MILLISECONDS;
  const latest = startsAt.getTime() - BOOKING_WINDOW_END_HOURS * HOUR_IN_MILLISECONDS;
  return now.getTime() >= earliest && now.getTime() <= latest;
}

export function validateBookingWindow(now: Date, startsAt: Date): void {
  if (now.getTime() >= startsAt.getTime()) {
    throw new GroupBookingError('SESSION_STARTED');
  }

  if (!isWithinBookingWindow(now, startsAt)) {
    throw new GroupBookingError('BOOKING_WINDOW_CLOSED');
  }
}

export function occurrenceReference(groupScheduleId: string, dateKey: string): string {
  return `schedule:${groupScheduleId}:${dateKey}`;
}

export function parseOccurrenceReference(
  reference: string,
): { groupScheduleId: string; dateKey: string } | null {
  const match = /^schedule:([0-9a-f-]{36}):(\d{4}-\d{2}-\d{2})$/i.exec(reference);
  return match ? { groupScheduleId: match[1], dateKey: match[2] } : null;
}
