import { Avatar, BrandIcon, type BrandIconName } from '@shared/ui';

import type { ChatRoomIcon, ChatRoomSummary } from '../model/types';
import { chatTone } from './chatCategoryStyle';
import { ChatIcon } from './ChatIcon';

// 모든 아이콘 방은 매이트 화면 카드와 같은 스타일의 브랜드 아이콘을 쓴다.
const BRAND_ICON: Partial<Record<ChatRoomIcon, BrandIconName>> = {
  utensils: 'meal',
  dollar: 'cart',
  bot: 'bot',
  building: 'office',
  shield: 'shield',
};

interface ChatAvatarProps {
  room: ChatRoomSummary;
  size?: 'sm' | 'md';
}

export function ChatAvatar({ room, size = 'md' }: ChatAvatarProps) {
  const md = size === 'md';
  if (!room.icon) return <Avatar name={room.name} seed={room.peerId} size={md ? 52 : 44} decorative className="shadow-xs" />;
  const brandIcon = BRAND_ICON[room.icon];

  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-xs',
        md ? 'size-[52px] rounded-[18px]' : 'size-11 rounded-[16px]',
        chatTone.tile,
      ].join(' ')}
    >
      {brandIcon
        ? <BrandIcon name={brandIcon} className={md ? 'size-[29px]' : 'size-[25px]'} />
        : <ChatIcon name={room.icon} className={md ? 'size-[22px]' : 'size-5'} />}
    </span>
  );
}
