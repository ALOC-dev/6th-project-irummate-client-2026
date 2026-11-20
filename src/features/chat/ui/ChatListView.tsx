import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { EmptyState, FilterChip, GlassCard, IconButton, PageHeader, Toast } from '@shared/ui';

import { chatRoomFixtures, previewOf } from '../model/fixtures';
import type { ChatCategory } from '../model/types';
import { ChatAvatar } from './ChatAvatar';
import { chatCategoryLabel } from './chatCategoryStyle';
import { ChatIcon } from './ChatIcon';

const FILTERS: Array<[ChatCategory, string]> = [['all', '전체'], ['match', '매칭'], ['mate', '매이트'], ['admin', '운영']];

export function ChatListView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ChatCategory>('all');
  const [toast, setToast] = useState('');
  const rooms = useMemo(() => chatRoomFixtures
    .filter((room) => filter === 'all' || room.category === filter)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))), [filter]);

  const goBack = () => {
    const routerIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (routerIndex > 0) navigate(-1);
    else navigate(paths.home, { replace: true });
  };

  return (
    <main className="min-h-dvh pb-[var(--safe-area-bottom)]">
      <h2 className="sr-only">CH-01 채팅 목록</h2>
      <PageHeader
        title="채팅"
        titleSize="page"
        leading={(
          <IconButton label="뒤로" variant="ghost" size="sm" onClick={goBack}>
            <ChatIcon name="arrow-left" className="size-6 text-fg-strong" />
          </IconButton>
        )}
        actions={(
          <IconButton label="검색" variant="ghost" size="sm" onClick={() => setToast('검색은 준비 중이에요')}>
            <ChatIcon name="search" className="size-[22px] text-fg-strong" />
          </IconButton>
        )}
      />

      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pb-6 pt-4">
        <div className="-mx-5 -mb-9 -mt-3 flex gap-2 overflow-x-auto px-5 pb-9 pt-3 [scrollbar-width:none]" role="group" aria-label="채팅 유형">
          {FILTERS.map(([key, label]) => (
            <FilterChip key={key} selected={filter === key} onClick={() => setFilter(key)}>
              {label}
            </FilterChip>
          ))}
        </div>

        {rooms.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {rooms.map((room) => {
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    aria-label={`${chatCategoryLabel[room.category]} 채팅 ${room.name}${room.unread ? `, 안 읽은 메시지 ${room.unread}개` : ''}`}
                    className={[
                      'flex w-full items-center gap-3 rounded-[24px] bg-surface-card px-3.5 py-3 text-left shadow-xs ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]',
                      'transition-transform duration-[var(--duration-fast)] active:scale-[0.985] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
                    ].join(' ')}
                    onClick={() => navigate(paths.chatRoom(room.id), { state: { chatStack: true } })}
                  >
                    <ChatAvatar room={room} />
                    <span className="min-w-0 flex-1">
                      <span className="mb-[3px] flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-body font-bold text-fg-strong">{room.name}</span>
                        {room.pinned ? <ChatIcon name="pin" className="size-[13px] shrink-0 text-fg-subtle" /> : null}
                        {room.lastAt ? <span className="shrink-0 text-micro text-fg-muted">{room.lastAt}</span> : null}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[13px] text-fg-body">{previewOf(room)}</span>
                        {room.unread ? (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-pill bg-primary px-1.5 text-micro font-bold text-fg-on-brand">{room.unread}</span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <GlassCard padding="none">
            <EmptyState
              icon={<ChatIcon name="chat" className="size-6" />}
              title="아직 채팅이 없어요"
              description="매칭되거나 매이트 모집에 참여하면 채팅이 시작돼요."
            />
          </GlassCard>
        )}
      </div>
      <Toast open={Boolean(toast)} onDismiss={() => setToast('')}>{toast}</Toast>
    </main>
  );
}
