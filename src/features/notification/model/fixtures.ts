import { paths } from '@app/router/paths';

import type { NotificationItem, NotificationPreferences } from './types';

const HOUR = 60 * 60_000;

function daysAgo(now: Date, days: number, hours: number): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, hours);
  return date.toISOString();
}

/** 시안의 알림 중 채팅을 뺀 5건. 시각은 지금을 기준으로 만든다. */
export function createNotificationFixtures(now: Date): NotificationItem[] {
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  return [
    {
      id: 'n1',
      category: 'matching',
      title: '새 매칭 요청이 왔어요',
      body: '생활 패턴이 92% 맞는 메이트예요.',
      createdAt: ago(HOUR),
      read: false,
      action: { label: '프로필 보기', to: paths.mateProfile('7') },
    },
    {
      id: 'n2',
      category: 'mate',
      title: '모집 인원이 다 찼어요',
      body: '[택시] 청량리역 → 생활관 · 4/4명',
      createdAt: ago(2 * HOUR),
      read: false,
      mateKind: 'OTHER',
    },
    {
      id: 'n3',
      category: 'dorm',
      title: '[생활관] 동절기 난방 점검 안내',
      body: '11월 24일(월) 10–12시에 호실 점검이 있어요.',
      createdAt: daysAgo(now, 1, 15),
      read: true,
    },
    {
      id: 'n4',
      category: 'mate',
      title: '새 참여 신청이 있어요',
      body: '이민준 님이 [배달] 치킨 모집에 참여했어요',
      createdAt: daysAgo(now, 2, 19),
      read: true,
      mateKind: 'MEAL',
    },
    {
      id: 'n5',
      category: 'mate',
      title: '모집이 마감됐어요',
      body: '[공구] 생수 2L 묶음 모집이 끝났어요',
      createdAt: daysAgo(now, 5, 12),
      read: true,
      mateKind: 'GROUP_BUY',
    },
  ];
}

export const notificationPreferenceFixture: NotificationPreferences = {
  paused: false,
  chat: true,
  matching: true,
  mate: true,
  dorm: true,
  marketing: true,
  nightMarketing: false,
};

/** 기기 알림이 꺼진 시안: 받을 수 있는 알림이 없어 모두 꺼져 있다. */
export const notificationPreferenceDeviceOffFixture: NotificationPreferences = {
  paused: false,
  chat: false,
  matching: false,
  mate: false,
  dorm: false,
  marketing: false,
  nightMarketing: false,
};
