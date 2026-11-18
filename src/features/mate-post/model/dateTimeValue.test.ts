import { describe, expect, it } from 'vitest';

import {
  earliestSlotAfter,
  formatDateTimeLabel,
  isNotFuture,
  parseDateTimeValue,
  toDateTimeValue,
} from './dateTimeValue';

describe('dateTimeValue', () => {
  it.each([
    ['2026-11-20T18:00', { date: '2026-11-20', hour24: 18, minute: 0 }],
    ['2026-01-05T07:30', { date: '2026-01-05', hour24: 7, minute: 30 }],
    ['', undefined],
    ['2026-11-20', undefined],
    ['2026-11-20T6:00', undefined],
  ])('parseDateTimeValue(%j)', (value, expected) => {
    expect(parseDateTimeValue(value)).toEqual(expected);
  });

  it.each([
    ['2026-11-20', 18, 0, '2026-11-20T18:00'],
    ['2026-01-05', 7, 5, '2026-01-05T07:05'],
  ])('toDateTimeValue(%s, %i, %i)', (date, hour, minute, expected) => {
    expect(toDateTimeValue(date, hour, minute)).toBe(expected);
  });

  it.each([
    ['같은 시각은 고를 수 없다', '2026-11-18', 14, 0, true],
    ['1분 전은 고를 수 없다', '2026-11-18', 13, 59, true],
    ['1분 뒤는 고를 수 있다', '2026-11-18', 14, 1, false],
    ['다음 날은 고를 수 있다', '2026-11-19', 0, 0, false],
  ])('isNotFuture: %s', (_, date, hour, minute, expected) => {
    expect(isNotFuture(date, hour, minute, new Date(2026, 10, 18, 14, 0))).toBe(expected);
  });

  it.each([
    ['14:07 → 14:10', [14, 7], { hour24: 14, minute: 10 }],
    ['14:10 정각이면 다음 칸', [14, 10], { hour24: 14, minute: 15 }],
    ['14:58 → 15:00', [14, 58], { hour24: 15, minute: 0 }],
    ['23:56이면 오늘은 더 없음', [23, 56], undefined],
  ] as const)('earliestSlotAfter(5분): %s', (_, [hour, minute], expected) => {
    expect(earliestSlotAfter(new Date(2026, 10, 18, hour, minute), 5)).toEqual(expected);
  });

  it.each([
    ['2026-11-20T18:00', '11월 20일 (금) 18:00'],
    ['2026-11-21T00:05', '11월 21일 (토) 00:05'],
    ['2026-12-01T09:30', '12월 1일 (화) 09:30'],
    ['', undefined],
  ])('formatDateTimeLabel(%j)', (value, expected) => {
    expect(formatDateTimeLabel(value)).toBe(expected);
  });
});
