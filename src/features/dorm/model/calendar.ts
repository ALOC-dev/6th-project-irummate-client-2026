import type { DormEvent } from './types';

export interface YearMonth {
  year: number;
  month: number;
}

export function dateKey(year: number, month: number, date: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

export function toDateKey(date: Date): string {
  return dateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

export function shiftMonth({ year, month }: YearMonth, amount: number): YearMonth {
  const next = new Date(year, month + amount, 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}

export function monthCells({ year, month }: YearMonth): Array<number | null> {
  const leading = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: days }, (_, index) => index + 1),
  ];
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function groupByDate(events: DormEvent[]): Map<string, DormEvent[]> {
  const grouped = new Map<string, DormEvent[]>();
  for (const event of events) grouped.set(event.date, [...(grouped.get(event.date) ?? []), event]);
  return grouped;
}

export function nextEventAfter(events: DormEvent[], key: string): DormEvent | undefined {
  return [...events].sort((a, b) => a.date.localeCompare(b.date)).find((event) => event.date > key);
}

export function selectedLabel(key: string, todayKey: string): string {
  const [, month, date] = key.split('-').map(Number);
  return `${month}월 ${date}일${key === todayKey ? ' · 오늘' : ''}`;
}

export function emptyLabel(events: DormEvent[], selectedKey: string, todayKey: string): string {
  const next = selectedKey === todayKey ? nextEventAfter(events, todayKey) : undefined;
  if (!next) return '일정이 없어요';
  const [, month, date] = next.date.split('-').map(Number);
  return `일정이 없어요 · 다음 일정: ${month}/${date} ${next.title}`;
}
