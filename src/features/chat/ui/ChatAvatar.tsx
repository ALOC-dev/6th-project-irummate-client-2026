import { Avatar } from '@shared/ui';

import type { ChatRoomSummary } from '../model/types';
import { chatCategoryStyle } from './chatCategoryStyle';
import { ChatIcon } from './ChatIcon';

interface ChatAvatarProps {
  room: ChatRoomSummary;
  size?: 'sm' | 'md';
}

export function ChatAvatar({ room, size = 'md' }: ChatAvatarProps) {
  const style = chatCategoryStyle[room.category];
  const md = size === 'md';
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-xs ring-1 ring-inset ring-glass-edge',
        md ? 'size-[52px] rounded-[18px]' : 'size-11 rounded-[16px]',
        md ? style.tile : 'bg-surface-card [backdrop-filter:var(--glass-filter)]',
        style.fg,
      ].join(' ')}
    >
      {room.icon
        ? <ChatIcon name={room.icon} className={md ? 'size-[22px]' : 'size-5'} />
        : <Avatar name={room.name} size={md ? 44 : 38} />}
    </span>
  );
}
