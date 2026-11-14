import type { NotificationPreferences } from './types';

export const notificationPreferenceFixture: NotificationPreferences = {
  enabled: true,
  roommateMatch: true,
  mateActivity: true,
  chatMessage: true,
  dormNotice: true,
  marketing: false,
  quietHours: false,
  quietStart: '23:00',
  quietEnd: '07:00',
};
