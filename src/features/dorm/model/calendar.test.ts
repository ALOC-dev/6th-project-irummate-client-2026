import { describe, expect, it } from 'vitest';

import { dateKey, emptyLabel, groupByDate, monthCells, nextEventAfter, selectedLabel, shiftMonth } from './calendar';
import type { DormEvent } from './types';

const events: DormEvent[] = [
  { id: 'b', date: '2026-11-27', title: '정기 호실 점검', category: '점검' },
  { id: 'a', date: '2026-11-20', title: '동계 잔류 신청 시작', category: '신청' },
  { id: 'c', date: '2026-11-20', title: '간담회', category: '행사' },
];

describe('calendar', () => {
  it.each([
    [2026, 0, 1, '2026-01-01'],
    [2026, 10, 17, '2026-11-17'],
    [2026, 11, 31, '2026-12-31'],
  ])('dateKey(%i, %i, %i) → %s', (year, month, date, expected) => {
    expect(dateKey(year, month, date)).toBe(expected);
  });

  it.each([
    [{ year: 2026, month: 0 }, -1, { year: 2025, month: 11 }],
    [{ year: 2026, month: 11 }, 1, { year: 2027, month: 0 }],
    [{ year: 2026, month: 10 }, 1, { year: 2026, month: 11 }],
  ])('shiftMonth(%o, %i) → %o', (from, amount, expected) => {
    expect(shiftMonth(from, amount)).toEqual(expected);
  });

  it.each([
    [{ year: 2026, month: 10 }, 0, 35],
    [{ year: 2026, month: 1 }, 0, 28],
    [{ year: 2026, month: 7 }, 6, 42],
  ])('monthCells(%o): 앞 빈칸 %i개, 총 %i칸', (ym, leading, total) => {
    const cells = monthCells(ym);
    expect(cells).toHaveLength(total);
    expect(cells.findIndex((cell) => cell === 1)).toBe(leading);
    expect(cells.length % 7).toBe(0);
  });

  it('같은 날 일정을 묶는다', () => {
    expect(groupByDate(events).get('2026-11-20')?.map((event) => event.id)).toEqual(['a', 'c']);
  });

  it.each([
    ['2026-11-17', 'a'],
    ['2026-11-20', 'b'],
    ['2026-11-27', undefined],
  ])('nextEventAfter(%s) → %s', (key, expected) => {
    expect(nextEventAfter(events, key)?.id).toBe(expected);
  });

  it.each([
    ['2026-11-17', '2026-11-17', '11월 17일 · 오늘'],
    ['2026-11-03', '2026-11-17', '11월 3일'],
  ])('selectedLabel(%s, 오늘 %s) → %s', (key, today, expected) => {
    expect(selectedLabel(key, today)).toBe(expected);
  });

  it.each([
    ['2026-11-17', '2026-11-17', '일정이 없어요 · 다음 일정: 11/20 동계 잔류 신청 시작'],
    ['2026-11-18', '2026-11-17', '일정이 없어요'],
    ['2026-11-30', '2026-11-30', '일정이 없어요'],
  ])('emptyLabel(선택 %s, 오늘 %s) → %s', (selected, today, expected) => {
    expect(emptyLabel(events, selected, today)).toBe(expected);
  });
});
