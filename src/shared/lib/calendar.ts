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

/** 일요일부터 시작하는 달력 칸. 앞뒤 빈칸은 null이고 7의 배수로 맞춘다. */
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

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
