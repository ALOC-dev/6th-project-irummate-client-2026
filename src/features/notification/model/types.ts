// 채팅 메시지 알림은 채팅 목록에서 확인하므로 알림 목록에 두지 않는다.
export type NotificationCategory = 'matching' | 'mate' | 'dorm';

/** 매이트 알림이 가리키는 모집글의 분류. mate-post의 분류 값과 같다. */
export type NotificationMateKind = 'MEAL' | 'HOBBY' | 'GROUP_BUY' | 'OTHER';

export type NotificationFilter = 'all' | NotificationCategory;

export interface NotificationAction {
  label: string;
  /** paths.ts로 만든 이동 경로 */
  to: string;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** ISO 8601 시각 */
  createdAt: string;
  read: boolean;
  /** category가 mate일 때 모집글 분류. 아이콘을 고르는 데 쓴다. */
  mateKind?: NotificationMateKind;
  action?: NotificationAction;
}

export interface NotificationGroup {
  label: '오늘' | '이전';
  items: NotificationItem[];
}

export interface NotificationPreferences {
  /** 푸시 알림 일시 중단 */
  paused: boolean;
  chat: boolean;
  matching: boolean;
  mate: boolean;
  dorm: boolean;
  marketing: boolean;
  /** 야간(21시–08시) 혜택 알림. 마케팅 수신에 동의해야 켤 수 있다. */
  nightMarketing: boolean;
}

export type NotificationPreferenceKey = keyof NotificationPreferences;
