import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { GlassCard, IconButton } from '@shared/ui';

import { chatRoomFixtures } from '../model/fixtures';
import type { ChatCategory } from '../model/types';
import { ChatAvatar } from './ChatAvatar';
import { ChatIcon } from './ChatIcon';

const filters: Array<{ key: ChatCategory; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'match', label: '매칭' },
  { key: 'mate', label: '매이트' },
  { key: 'admin', label: '운영' },
];

const categoryLabel: Record<Exclude<ChatCategory, 'all'>, string> = {
  match: '룸메이트', mate: '매이트', admin: '운영',
};

export function ChatListView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ChatCategory>('all');
  const rooms = useMemo(() => chatRoomFixtures.filter((room) => filter === 'all' || room.category === filter), [filter]);

  const goBack = () => {
    const routerIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (routerIndex > 0) navigate(-1);
    else navigate(paths.home, { replace: true });
  };

  return (
    <main className="min-h-dvh pb-[var(--safe-area-bottom)] pt-[var(--safe-area-top)]">
      <h2 className="sr-only">CH-01 채팅 목록</h2>
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-glass-bar [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center gap-2 px-3">
          <IconButton label="이전 화면" variant="ghost" onClick={goBack}><ChatIcon name="arrow-left" className="size-6" /></IconButton>
          <h1 className="text-title-2 font-bold tracking-irum-tight text-fg-strong">채팅</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-5 py-5">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]" aria-label="채팅 유형">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={[
                'h-10 shrink-0 rounded-pill px-4 text-body-sm font-semibold transition-[background-color,box-shadow,transform]',
                'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] active:scale-[var(--press-scale)]',
                filter === item.key ? 'bg-primary text-fg-on-brand shadow-brand' : 'bg-surface-card text-fg-body shadow-xs ring-1 ring-inset ring-glass-edge',
              ].join(' ')}
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {rooms.length ? (
          <GlassCard padding="none" className="mt-4 overflow-hidden">
            <ul className="divide-y divide-border-subtle">
              {rooms.map((room) => (
                <li key={room.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                    onClick={() => navigate(paths.chatRoom(room.id), { state: { chatStack: true } })}
                  >
                    <ChatAvatar room={room} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <strong className="truncate text-body font-bold text-fg-strong">{room.name}</strong>
                        <span className="rounded-pill bg-ink-100 px-2 py-0.5 text-micro font-semibold text-fg-muted">{categoryLabel[room.category]}</span>
                      </span>
                      <span className="mt-1 block truncate text-body-sm text-fg-muted">{room.preview}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-micro text-fg-subtle">{room.lastAt}</span>
                      {room.unread ? <span className="flex min-w-5 items-center justify-center rounded-pill bg-primary px-1.5 py-0.5 text-micro font-bold text-fg-on-brand">{room.unread}</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </GlassCard>
        ) : (
          <GlassCard className="mt-4 flex min-h-56 flex-col items-center justify-center text-center">
            <span className="flex size-14 items-center justify-center rounded-pill bg-primary-soft text-fg-brand"><ChatIcon name="chat" className="size-6" /></span>
            <h2 className="mt-4 text-title-3 font-bold text-fg-strong">아직 채팅이 없어요</h2>
            <p className="mt-2 max-w-64 text-body-sm leading-6 text-fg-muted">매칭되거나 매이트 모집에 참여하면 채팅이 시작돼요.</p>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
