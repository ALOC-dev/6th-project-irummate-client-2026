import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { formatNotificationTime, NOTIFICATION_CATEGORY_LABEL } from '../model/notifications';
import type { NotificationItem } from '../model/types';

// 채팅 목록 아이콘 타일(ChatAvatar sm)과 같은 모양: 회색 바탕에 브랜드 파란색 한 계열.
const TILE = 'flex size-11 items-center justify-center overflow-hidden rounded-[16px] bg-surface-icon text-fg-brand shadow-xs [&>*]:size-[25px]';

interface NotificationRowProps {
  item: NotificationItem;
  icon: ReactNode;
  now: Date;
}

export function NotificationRow({ item, icon, now }: NotificationRowProps) {
  const navigate = useNavigate();
  const action = item.action;

  return (
    <article
      className={['flex gap-3.5 px-5 py-4', item.read ? '' : 'bg-primary-soft/50'].join(' ')}
    >
      <span className="relative size-11 shrink-0">
        <span aria-hidden="true" className={TILE}>{icon}</span>
        {item.read ? null : (
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-pill bg-danger ring-2 ring-fg-on-brand">
            <span className="sr-only">읽지 않음</span>
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="m-0 text-body font-bold text-fg-strong">{item.title}</h3>
        <p className="m-0 text-body-sm leading-[1.45] text-fg-body">{item.body}</p>
        <p className="m-0 mt-0.5 text-caption text-fg-subtle">
          {NOTIFICATION_CATEGORY_LABEL[item.category]} · {formatNotificationTime(item.createdAt, now)}
        </p>
        {action ? (
          <button
            type="button"
            onClick={() => navigate(action.to)}
            className="mt-2.5 flex min-h-10 items-center justify-center rounded-sm bg-surface-card text-body-sm font-semibold text-fg-strong ring-1 ring-inset ring-border-default transition-transform active:scale-[var(--press-scale)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </article>
  );
}
