import type { ChatRoomCategory } from '../model/types';

export const chatCategoryLabel: Record<ChatRoomCategory, string> = {
  bot: '챗봇',
  match: '매칭',
  mate: '매이트',
  admin: '운영',
};

// 유형마다 색을 나누지 않고 브랜드 파란색 한 계열로 맞춘다.
export const chatTone = {
  tile: 'bg-surface-icon text-fg-brand',
  bubble: 'bg-primary-soft ring-primary/25',
} as const;
