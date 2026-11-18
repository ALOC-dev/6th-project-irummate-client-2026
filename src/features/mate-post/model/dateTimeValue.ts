// 작성 폼의 일시 값은 'YYYY-MM-DDTHH:mm'(기기 시간대, 24시간제) 문자열이다. 예전 datetime-local 입력과 같은 형식이다.

export interface DateTimeParts {
  date: string;
  hour24: number;
  minute: number;
}

const VALUE_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;
const WEEKDAYS = '일월화수목금토';

export const pad2 = (value: number) => String(value).padStart(2, '0');

export function parseDateTimeValue(value: string): DateTimeParts | undefined {
  const match = VALUE_PATTERN.exec(value);
  if (!match) return undefined;
  const [, date = '', hour = '', minute = ''] = match;
  return { date, hour24: Number(hour), minute: Number(minute) };
}

export function toDateTimeValue(date: string, hour24: number, minute: number): string {
  return `${date}T${pad2(hour24)}:${pad2(minute)}`;
}

/** 지금보다 늦지 않은(같거나 이른) 시각이면 true. 고를 수 없는 시각을 막는 데 쓴다. */
export function isNotFuture(date: string, hour24: number, minute: number, now: Date): boolean {
  return new Date(toDateTimeValue(date, hour24, minute)).getTime() <= now.getTime();
}

/** 오늘 남은 시각 가운데 step분 단위로 가장 이른 칸. 오늘 더 고를 칸이 없으면 undefined. */
export function earliestSlotAfter(now: Date, step: number): { hour24: number; minute: number } | undefined {
  const next = Math.floor((now.getHours() * 60 + now.getMinutes()) / step) * step + step;
  if (next >= 24 * 60) return undefined;
  return { hour24: Math.floor(next / 60), minute: next % 60 };
}

/** '11월 20일 (금) 18:00' */
export function formatDateTimeLabel(value: string): string | undefined {
  const parts = parseDateTimeValue(value);
  if (!parts) return undefined;
  const [year, month, day] = parts.date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year ?? 0, (month ?? 1) - 1, day ?? 1).getDay()];
  return `${month}월 ${day}일 (${weekday}) ${pad2(parts.hour24)}:${pad2(parts.minute)}`;
}
