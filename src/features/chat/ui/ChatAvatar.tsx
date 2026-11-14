import type { ChatRoomSummary } from '../model/types';

const tone: Record<ChatRoomSummary['category'], string> = {
  match: 'bg-primary-soft text-fg-brand',
  mate: 'bg-success-soft text-success',
  admin: 'bg-warning-soft text-warning',
};

export function ChatAvatar({ room, size = 'md' }: { room: ChatRoomSummary; size?: 'sm' | 'md' }) {
  const initial = room.name.replace('이룸메이트 ', '').charAt(0);
  return (
    <span className={[
      'relative inline-flex shrink-0 items-center justify-center rounded-pill font-extrabold shadow-xs ring-2 ring-glass-edge',
      size === 'md' ? 'size-14 text-title-3' : 'size-10 text-body-sm',
      tone[room.category],
    ].join(' ')} aria-hidden="true">
      {initial}
      {room.online ? <span className="absolute bottom-0 right-0 size-3.5 rounded-pill bg-success ring-2 ring-surface-card" /> : null}
    </span>
  );
}
