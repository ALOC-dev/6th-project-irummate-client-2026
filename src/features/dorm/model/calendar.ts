import type { DormEvent } from './types';

export { dateKey, monthCells, shiftMonth, toDateKey, type YearMonth } from '@shared/lib';

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
