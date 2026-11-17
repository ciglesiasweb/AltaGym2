import { describe, expect, it } from 'vitest';
import {
  addCalendarDays,
  isWithinBookingWindow,
  madridDateKey,
  madridDateTimeToInstant,
  madridWeekday,
  occurrenceReference,
  parseOccurrenceReference,
  validateBookingWindow,
} from './group-booking-domain';

describe('group booking time rules', () => {
  const startsAt = new Date('2026-11-20T12:00:00.000Z');

  it('includes both exact booking-window boundaries', () => {
    expect(isWithinBookingWindow(new Date(startsAt.getTime() - 72 * 60 * 60 * 1000), startsAt)).toBe(true);
    expect(isWithinBookingWindow(new Date(startsAt.getTime() - 3 * 60 * 60 * 1000), startsAt)).toBe(true);
    expect(isWithinBookingWindow(new Date(startsAt.getTime() - 72 * 60 * 60 * 1000 - 1), startsAt)).toBe(false);
    expect(isWithinBookingWindow(new Date(startsAt.getTime() - 3 * 60 * 60 * 1000 + 1), startsAt)).toBe(false);
  });

  it('prioritizes the start instant over the closed booking window', () => {
    expect(() => validateBookingWindow(startsAt, startsAt)).toThrow(
      expect.objectContaining({ code: 'SESSION_STARTED' }),
    );
    expect(() => validateBookingWindow(new Date(startsAt.getTime() + 1), startsAt)).toThrow(
      expect.objectContaining({ code: 'SESSION_STARTED' }),
    );
  });

  it('converts recurring class times using the Madrid offset for each date', () => {
    const localStart = new Date('1970-01-01T08:00:00.000Z');

    expect(madridDateTimeToInstant('2026-01-15', localStart).toISOString()).toBe(
      '2026-01-15T07:00:00.000Z',
    );
    expect(madridDateTimeToInstant('2026-07-15', localStart).toISOString()).toBe(
      '2026-07-15T06:00:00.000Z',
    );
  });

  it('uses Madrid calendar dates and ISO weekdays for schedule occurrences', () => {
    expect(madridDateKey(new Date('2026-01-01T23:30:00.000Z'))).toBe('2026-01-02');
    expect(madridWeekday('2026-01-05')).toBe(1);
    expect(madridWeekday('2026-01-11')).toBe(7);
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('group session occurrence references', () => {
  it('round-trips the stable reference for an unmaterialized occurrence', () => {
    const reference = occurrenceReference(
      '9bb10003-3d37-4b54-a36c-117e694c3b6a',
      '2026-11-20',
    );

    expect(parseOccurrenceReference(reference)).toEqual({
      groupScheduleId: '9bb10003-3d37-4b54-a36c-117e694c3b6a',
      dateKey: '2026-11-20',
    });
    expect(parseOccurrenceReference('invalid')).toBeNull();
  });
});
