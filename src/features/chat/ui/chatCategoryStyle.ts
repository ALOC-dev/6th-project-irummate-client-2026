import type { ChatRoomCategory } from '../model/types';

interface ChatCategoryStyle {
  label: string;
  tile: string;
  fg: string;
  badge: string;
  bubble: string;
  dot: string;
  chipOn: string;
}

export const chatCategoryStyle: Record<ChatRoomCategory, ChatCategoryStyle> = {
  bot: {
    label: '챗봇',
    tile: 'bg-primary-soft',
    fg: 'text-primary-strong',
    badge: 'bg-primary-soft text-primary-strong ring-primary/25',
    bubble: 'bg-primary-soft ring-primary/25',
    dot: 'bg-primary/70',
    chipOn: 'bg-primary',
  },
  match: {
    label: '매칭',
    tile: 'bg-peach-100',
    fg: 'text-coral-600',
    badge: 'bg-peach-100 text-coral-600 ring-peach-400/50',
    bubble: 'bg-peach-100 ring-peach-400/50',
    dot: 'bg-peach-400',
    chipOn: 'bg-coral-550',
  },
  mate: {
    label: '매이트',
    tile: 'bg-mint-100',
    fg: 'text-mint-600',
    badge: 'bg-mint-100 text-mint-600 ring-mint-400/50',
    bubble: 'bg-mint-100 ring-mint-400/50',
    dot: 'bg-mint-400',
    chipOn: 'bg-mint-600',
  },
  admin: {
    label: '운영',
    tile: 'bg-sun-100',
    fg: 'text-sun-600',
    badge: 'bg-sun-100 text-sun-600 ring-sun-400/60',
    bubble: 'bg-sun-100 ring-sun-400/60',
    dot: 'bg-sun-400',
    chipOn: 'bg-sun-600',
  },
};
