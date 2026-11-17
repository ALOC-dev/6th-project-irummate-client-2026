const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayDiff(value: Date, now: Date) {
  return Math.round((startOfDay(value) - startOfDay(now)) / DAY_MS);
}

function clock(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatShortDateTime(value: string, now = new Date()) {
  const date = new Date(value);
  const diff = dayDiff(date, now);
  if (diff === 0) return `오늘 ${clock(date)}`;
  if (diff === 1) return `내일 ${clock(date)}`;
  if (diff > 1 && diff < 7) return `${WEEKDAYS[date.getDay()]} ${clock(date)}`;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDeadline(value: string, now = new Date()) {
  const diff = dayDiff(new Date(value), now);
  if (diff <= 0) return '마감 오늘';
  return `마감 D-${diff}`;
}

export function formatCreatedAt(value: string, now = Date.now()) {
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000));
  if (elapsedMinutes < 1) return '방금';
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간 전`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return elapsedDays === 1 ? '어제' : `${elapsedDays}일 전`;
}
