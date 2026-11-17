import { describe, expect, it } from 'vitest';

import { formatCreatedAt, formatDeadline, formatShortDateTime } from './formatDateTime';

const now = new Date(2026, 10, 18, 9, 0);
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute).toISOString();

describe('formatDateTime', () => {
  it.each([
    [at(18, 18), '오늘 18:00'],
    [at(19, 7, 5), '내일 07:05'],
    [at(21, 7), '토 07:00'],
    [at(25, 20), '11월 25일'],
  ])('formatShortDateTime(%s) → %s', (value, expected) => {
    expect(formatShortDateTime(value, now)).toBe(expected);
  });

  it.each([
    [at(18, 23), '마감 오늘'],
    [at(19, 23, 59), '마감 D-1'],
    [at(21, 12), '마감 D-3'],
  ])('formatDeadline(%s) → %s', (value, expected) => {
    expect(formatDeadline(value, now)).toBe(expected);
  });

  it.each([
    [new Date(2026, 10, 18, 8, 59, 40).toISOString(), '방금'],
    [new Date(2026, 10, 18, 8, 50).toISOString(), '10분 전'],
    [new Date(2026, 10, 18, 7, 0).toISOString(), '2시간 전'],
    [new Date(2026, 10, 17, 8, 0).toISOString(), '어제'],
    [new Date(2026, 10, 16, 8, 0).toISOString(), '2일 전'],
  ])('formatCreatedAt(%s) → %s', (value, expected) => {
    expect(formatCreatedAt(value, now.getTime())).toBe(expected);
  });
});
