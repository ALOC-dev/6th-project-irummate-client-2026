import type {
  NotificationCategory,
  NotificationFilter,
  NotificationGroup,
  NotificationItem,
  NotificationPreferenceKey,
  NotificationPreferences,
} from './types';

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  matching: '매칭',
  mate: '매이트',
  dorm: '생활관 공지',
};

export const NOTIFICATION_FILTERS: NotificationFilter[] = ['all', 'matching', 'mate', 'dorm'];

export function notificationFilterLabel(filter: NotificationFilter): string {
  return filter === 'all' ? '전체' : NOTIFICATION_CATEGORY_LABEL[filter];
}

export function filterNotifications(items: NotificationItem[], filter: NotificationFilter): NotificationItem[] {
  return filter === 'all' ? items : items.filter((item) => item.category === filter);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

/** 같은 날이면 분·시간, 지난 날이면 달력 날짜 차이로 말한다. */
export function formatNotificationTime(createdAt: string, now: Date): string {
  const created = new Date(createdAt);
  const days = daysBetween(created, now);
  if (days <= 0) {
    const elapsed = Math.max(0, now.getTime() - created.getTime());
    if (elapsed < MINUTE) return '방금';
    if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
    return `${Math.floor(elapsed / HOUR)}시간 전`;
  }
  return days === 1 ? '어제' : `${days}일 전`;
}

/** 최신순으로 정렬해 오늘·이전으로 나눈다. 빈 묶음은 뺀다. */
export function groupNotificationsByDay(items: NotificationItem[], now: Date): NotificationGroup[] {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const isToday = (item: NotificationItem) => daysBetween(new Date(item.createdAt), now) <= 0;
  const groups: NotificationGroup[] = [
    { label: '오늘', items: sorted.filter(isToday) },
    { label: '이전', items: sorted.filter((item) => !isToday(item)) },
  ];
  return groups.filter((group) => group.items.length > 0);
}

/** 마케팅 수신을 끄면 야간 혜택 알림도 끈다. 마케팅 동의 없이는 야간 혜택 알림을 켤 수 없다. */
export function updatePreference(
  preferences: NotificationPreferences,
  key: NotificationPreferenceKey,
  value: boolean,
): NotificationPreferences {
  if (key === 'nightMarketing' && value && !preferences.marketing) return preferences;
  const next = { ...preferences, [key]: value };
  if (key === 'marketing' && !value) next.nightMarketing = false;
  return next;
}
