import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { paths } from '@app/router/paths';
import { IconButton } from '@shared/ui';

import { chatMessageFixtures, chatRoomFixtures } from '../model/fixtures';
import type { ChatMessage } from '../model/types';
import { ChatAvatar } from './ChatAvatar';
import { ChatIcon } from './ChatIcon';

export function ChatRoomView() {
  const { roomId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const room = chatRoomFixtures.find((item) => item.id === roomId) ?? chatRoomFixtures[0];
  const [messages, setMessages] = useState(() => chatMessageFixtures.filter((message) => message.roomId === room?.id));
  const [draft, setDraft] = useState('');

  if (!room) return null;

  const goBack = () => {
    const pushedFromList = Boolean((location.state as { chatStack?: boolean } | null)?.chatStack);
    if (pushedFromList) navigate(-1);
    else navigate(paths.chats, { replace: true });
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      roomId: room.id,
      sender: 'me',
      text,
      sentAt: '방금',
    };
    setMessages((current) => [...current, message]);
    setDraft('');
  };

  return (
    <main className="flex min-h-dvh flex-col pt-[var(--safe-area-top)]">
      <h2 className="sr-only">CH-02 채팅방</h2>
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-glass-bar [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center gap-2 px-3">
          <IconButton label="채팅 목록으로" variant="ghost" onClick={goBack}><ChatIcon name="arrow-left" className="size-6" /></IconButton>
          <ChatAvatar room={room} size="sm" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-body font-bold text-fg-strong">{room.name}</h1>
            <p className="text-caption text-fg-muted">{room.online ? '현재 접속 중' : '알림을 켜 두었어요'}</p>
          </div>
          <IconButton label="채팅방 메뉴" variant="ghost"><ChatIcon name="more" className="size-5" /></IconButton>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 py-5">
        <p className="mx-auto mb-5 rounded-pill bg-surface-card px-3 py-1 text-caption text-fg-muted shadow-xs">오늘</p>
        <div className="flex flex-1 flex-col gap-3" aria-live="polite">
          {messages.map((message) => {
            if (message.sender === 'system') {
              return <p key={message.id} className="mx-auto max-w-72 rounded-lg bg-primary-soft px-4 py-2.5 text-center text-caption leading-5 text-fg-brand">{message.text}</p>;
            }
            const mine = message.sender === 'me';
            return (
              <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div className={['flex max-w-[82%] items-end gap-1.5', mine ? 'flex-row-reverse' : ''].join(' ')}>
                  <p className={[
                    'rounded-lg px-4 py-3 text-body-sm leading-6 shadow-xs',
                    mine ? 'rounded-br-sm bg-primary text-fg-on-brand' : 'rounded-bl-sm bg-surface-card text-fg-strong ring-1 ring-inset ring-glass-edge',
                  ].join(' ')}>{message.text}</p>
                  <span className="shrink-0 text-micro text-fg-subtle">{message.sentAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        className="sticky bottom-0 z-20 border-t border-border-subtle bg-glass-bar px-4 pb-[calc(0.75rem+var(--safe-area-bottom))] pt-3 [backdrop-filter:var(--glass-filter)]"
        onSubmit={send}
      >
        <div className="mx-auto flex w-full max-w-[480px] items-end gap-2">
          <label className="sr-only" htmlFor="chat-message">메시지</label>
          <textarea
            id="chat-message"
            rows={1}
            className="min-h-12 max-h-28 flex-1 resize-none rounded-control bg-glass-input px-4 py-3 text-body text-fg-strong shadow-xs ring-1 ring-inset ring-border-subtle placeholder:text-fg-subtle focus:outline-none focus:shadow-[var(--focus-ring)]"
            placeholder="메시지를 입력하세요"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary text-fg-on-brand shadow-brand disabled:opacity-40"
            aria-label="메시지 보내기"
            disabled={!draft.trim()}
          >
            <ChatIcon name="send" className="size-5" />
          </button>
        </div>
      </form>
    </main>
  );
}
