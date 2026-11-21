import { describe, expect, it } from 'vitest';

import { createNotificationFixtures, notificationPreferenceFixture } from './fixtures';
import {
  filterNotifications,
  formatNotificationTime,
  groupNotificationsByDay,
  notificationFilterLabel,
  updatePreference,
} from './notifications';
import type { NotificationFilter, NotificationPreferences } from './types';

const now = new Date(2026, 10, 21, 14, 0);
const at = (day: number, hour: number, minute: number, second = 0) =>
  new Date(2026, 10, day, hour, minute, second).toISOString();

describe('formatNotificationTime', () => {
  it.each([
    ['30초 전', at(21, 13, 59, 30), '방금'],
    ['3분 전', at(21, 13, 57), '3분 전'],
    ['59분 전', at(21, 13, 1), '59분 전'],
    ['1시간 전', at(21, 13, 0), '1시간 전'],
    ['오늘 0시', at(21, 0, 0), '14시간 전'],
    ['어제 밤', at(20, 23, 50), '어제'],
    ['2일 전', at(19, 9, 0), '2일 전'],
    ['미래 시각', at(21, 14, 5), '방금'],
  ])('%s → %s', (_, createdAt, expected) => {
    expect(formatNotificationTime(createdAt, now)).toBe(expected);
  });
});

describe('filterNotifications', () => {
  const items = createNotificationFixtures(now);

  it.each<[NotificationFilter, string, number]>([
    ['all', '전체', 5],
    ['matching', '매칭', 1],
    ['mate', '매이트', 3],
    ['dorm', '생활관 공지', 1],
  ])('%s(%s) → %i건', (filter, label, count) => {
    expect(notificationFilterLabel(filter)).toBe(label);
    expect(filterNotifications(items, filter)).toHaveLength(count);
  });
});

describe('groupNotificationsByDay', () => {
  it('최신순으로 오늘·이전을 나눈다', () => {
    const groups = groupNotificationsByDay(createNotificationFixtures(now), now);
    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      ['오늘', ['n1', 'n2']],
      ['이전', ['n3', 'n4', 'n5']],
    ]);
  });

  it('빈 묶음은 빼고 보여준다', () => {
    const dormOnly = filterNotifications(createNotificationFixtures(now), 'dorm');
    expect(groupNotificationsByDay(dormOnly, now).map((group) => group.label)).toEqual(['이전']);
  });
});

describe('updatePreference', () => {
  const base = notificationPreferenceFixture;
  const off: NotificationPreferences = { ...base, marketing: false, nightMarketing: false };

  it.each<[string, NotificationPreferences, keyof NotificationPreferences, boolean, Partial<NotificationPreferences>]>([
    ['채팅 끄기', base, 'chat', false, { chat: false }],
    ['일시 중단 켜기', base, 'paused', true, { paused: true }],
    ['마케팅 동의 상태에서 야간 켜기', base, 'nightMarketing', true, { nightMarketing: true }],
    ['마케팅 끄면 야간도 꺼짐', { ...base, nightMarketing: true }, 'marketing', false, { marketing: false, nightMarketing: false }],
    ['마케팅 미동의면 야간을 켤 수 없음', off, 'nightMarketing', true, {}],
  ])('%s', (_, preferences, key, value, changed) => {
    expect(updatePreference(preferences, key, value)).toEqual({ ...preferences, ...changed });
  });
});
