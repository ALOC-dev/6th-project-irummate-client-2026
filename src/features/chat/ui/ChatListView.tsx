import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { Toast } from '@shared/ui';

import { chatRoomFixtures, previewOf } from '../model/fixtures';
import type { ChatCategory, ChatRoomCategory } from '../model/types';
import { ChatAvatar } from './ChatAvatar';
import { chatCategoryStyle } from './chatCategoryStyle';
import { ChatIcon } from './ChatIcon';

const FILTERS: Array<[ChatCategory, string]> = [['all', '전체'], ['match', '매칭'], ['mate', '매이트'], ['admin', '운영']];

const HEADER_BUTTON = 'inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-fg-strong hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]';

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
    <main className="min-h-dvh pb-[var(--safe-area-bottom)] pt-[var(--safe-area-top)]">
      <h2 className="sr-only">CH-01 채팅 목록</h2>
      <header className="sticky top-0 z-20 bg-glass-bar shadow-[inset_0_-1px_0_var(--color-glass-edge)] [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-[var(--topbar-height)] w-full max-w-[480px] items-center gap-1 px-2">
          <button type="button" aria-label="뒤로" className={HEADER_BUTTON} onClick={goBack}>
            <ChatIcon name="arrow-left" className="size-6" />
          </button>
          <h1 className="m-0 flex-1 px-2 text-[22px] font-extrabold tracking-irum-tight text-fg-strong">채팅</h1>
          <button type="button" aria-label="검색" className={HEADER_BUTTON} onClick={() => setToast('검색은 준비 중이에요')}>
            <ChatIcon name="search" className="size-[22px]" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3.5 px-5 pb-6 pt-1">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none]" role="group" aria-label="채팅 유형">
          {FILTERS.map(([key, label]) => {
            const on = filter === key;
            const style = key === 'all' ? undefined : chatCategoryStyle[key as ChatRoomCategory];
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                className={[
                  'inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-4 text-body-sm',
                  'transition-[background-color,color,box-shadow] duration-[var(--duration-base)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
                  on
                    ? ['font-bold text-fg-on-brand shadow-sm ring-1 ring-inset ring-glass-edge/30', style ? style.chipOn : 'bg-primary shadow-brand'].join(' ')
                    : 'bg-surface-card font-semibold text-fg-body shadow-xs ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]',
                ].join(' ')}
                onClick={() => setFilter(key)}
              >
                {style ? <span aria-hidden="true" className={['size-2 rounded-pill ring-2 ring-glass-edge', style.dot].join(' ')} /> : null}
                {label}
              </button>
            );
          })}
        </div>

        {rooms.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {rooms.map((room) => {
              const style = chatCategoryStyle[room.category];
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    aria-label={`${style.label} 채팅 ${room.name}${room.unread ? `, 안 읽은 메시지 ${room.unread}개` : ''}`}
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
          <p className="m-0 py-12 text-center text-body-sm text-fg-muted">아직 대화가 없어요</p>
        )}
      </div>
      <Toast open={Boolean(toast)} onDismiss={() => setToast('')}>{toast}</Toast>
    </main>
  );
}
