import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { paths } from '@app/router/paths';
import { Avatar, Button, EmptyState } from '@shared/ui';

import { botReply } from '../model/botReply';
import { chatMessageFixtures, chatRoomFixtures } from '../model/fixtures';
import type { ChatMessage } from '../model/types';
import { ChatAvatar } from './ChatAvatar';
import { chatCategoryStyle } from './chatCategoryStyle';
import { ChatIcon } from './ChatIcon';

const BOT_DELAY_MS = 700;
const ICON_BUTTON = 'inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-fg-strong hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]';

function dayLabel(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${'일월화수목금토'[date.getDay()]}요일`;
}

function clockNow() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

interface ChatRoomViewProps {
  today?: Date;
}

export function ChatRoomView({ today = new Date() }: ChatRoomViewProps) {
  const { roomId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const room = chatRoomFixtures.find((item) => item.id === roomId);
  const [messages, setMessages] = useState(() => chatMessageFixtures.filter((message) => message.roomId === room?.id));
  const [draft, setDraft] = useState('');
  const botTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(botTimer.current), []);

  if (!room) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5 pt-[var(--safe-area-top)]">
        <h2 className="sr-only">CH-02 채팅방</h2>
        <EmptyState
          title="채팅방을 찾을 수 없어요"
          description="삭제되었거나 참여할 수 없는 채팅방이에요."
          action={<Button onClick={() => navigate(paths.chats, { replace: true })}>채팅 목록으로</Button>}
        />
      </main>
    );
  }

  const style = chatCategoryStyle[room.category];
  const showNames = Boolean(room.group) || room.category === 'admin' || room.category === 'bot';

  const goBack = () => {
    const pushedFromList = Boolean((location.state as { chatStack?: boolean } | null)?.chatStack);
    if (pushedFromList) navigate(-1);
    else navigate(paths.chats, { replace: true });
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const sentAt = clockNow();
    const message: ChatMessage = { id: `local-${Date.now()}`, roomId: room.id, sender: 'me', text, sentAt };
    setMessages((current) => [...current, message]);
    setDraft('');
    if (room.category !== 'bot') return;
    window.clearTimeout(botTimer.current);
    botTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `bot-${Date.now()}`, roomId: room.id, sender: 'other', from: room.name, text: botReply(text), sentAt },
      ]);
    }, BOT_DELAY_MS);
  };

  return (
    <main className="flex min-h-dvh flex-col pt-[var(--safe-area-top)]">
      <h2 className="sr-only">CH-02 채팅방</h2>
      <header className="sticky top-0 z-20 bg-glass-bar shadow-[inset_0_-1px_0_var(--color-glass-edge)] [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex w-full max-w-[480px] items-center gap-2 px-2 pb-3 pt-2.5">
          <button type="button" aria-label="뒤로" className={ICON_BUTTON} onClick={goBack}>
            <ChatIcon name="arrow-left" className="size-6" />
          </button>
          <ChatAvatar room={room} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="m-0 min-w-0 truncate text-[16px] font-bold tracking-irum-tight text-fg-strong">{room.name}</h1>
              <span className={['inline-flex h-[22px] shrink-0 items-center rounded-pill px-2 text-micro font-bold ring-1 ring-inset', style.badge].join(' ')}>
                {style.label}
              </span>
            </div>
            <p className="m-0 mt-0.5 truncate text-caption text-fg-muted">{room.subtitle}</p>
          </div>
          <button type="button" aria-label="더보기" className={ICON_BUTTON}>
            <ChatIcon name="more" className="size-6" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-1 px-4 pb-3 pt-4" aria-live="polite">
        <p className="m-0 mb-2.5 self-center rounded-pill bg-glass-soft px-2.5 py-1 text-micro font-semibold text-fg-subtle ring-1 ring-inset ring-glass-edge">
          {dayLabel(today)}
        </p>
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const firstOfRun = !previous || previous.sender !== message.sender || previous.from !== message.from;
          const gap = firstOfRun && index ? 'mt-2.5' : '';

          if (message.sender === 'system') {
            return <p key={message.id} className={['m-0 self-center rounded-lg bg-primary-soft px-4 py-2 text-center text-caption text-fg-brand', gap].join(' ')}>{message.text}</p>;
          }

          if (message.sender === 'me') {
            return (
              <div key={message.id} className={['flex items-end justify-end gap-1.5', gap].join(' ')}>
                <span className="shrink-0 text-[10px] text-fg-subtle">{message.sentAt}</span>
                <p className={['m-0 max-w-[72%] break-keep rounded-[20px] rounded-tr-[6px] px-[15px] py-2.5 text-body leading-[22px] text-fg-strong shadow-xs ring-1 ring-inset', style.bubble].join(' ')}>
                  {message.text}
                </p>
              </div>
            );
          }

          return (
            <div key={message.id} className={['flex items-start gap-2', gap].join(' ')}>
              {firstOfRun ? <Avatar name={message.from ?? room.name} size={32} /> : <span className="w-8 shrink-0" />}
              <div className="flex max-w-[72%] flex-col gap-1">
                {showNames && firstOfRun ? <span className="text-caption font-semibold text-fg-muted">{message.from ?? room.name}</span> : null}
                <div className="flex items-end gap-1.5">
                  <p className="m-0 break-keep rounded-[20px] rounded-tl-[6px] bg-glass-input px-[15px] py-2.5 text-body leading-[22px] text-fg-strong shadow-xs ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]">
                    {message.text}
                  </p>
                  <span className="shrink-0 text-[10px] text-fg-subtle">{message.sentAt}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="sticky bottom-0 z-20 bg-glass-bar shadow-[inset_0_1px_0_var(--color-glass-edge)] [backdrop-filter:var(--glass-filter)]"
        onSubmit={send}
      >
        <div className="mx-auto flex w-full max-w-[480px] items-center gap-2 px-3 pb-[calc(12px+var(--safe-area-bottom))] pt-2.5">
          <button type="button" aria-label="첨부" className={ICON_BUTTON}>
            <ChatIcon name="plus" className="size-6" />
          </button>
          <label className="sr-only" htmlFor="chat-message">메시지</label>
          <input
            id="chat-message"
            type="text"
            enterKeyHint="send"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-pill bg-glass-input px-[18px] text-[16px] text-fg-strong ring-1 ring-inset ring-border-subtle placeholder:text-fg-subtle focus:outline-none focus:shadow-[var(--focus-ring)]"
            placeholder="메시지를 입력하세요"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            aria-label="메시지 보내기"
            className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-primary text-fg-on-brand shadow-brand transition-transform duration-[var(--duration-fast)] active:scale-90 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            <ChatIcon name="send" className="size-5" />
          </button>
        </div>
      </form>
    </main>
  );
}
