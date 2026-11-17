import type { KeyboardEvent } from 'react';

import { estimateFeePerPerson } from '../model/estimateFeePerPerson';
import { formatCreatedAt, formatDeadline, formatShortDateTime } from '../model/formatDateTime';
import { mateCategoryLabels, type MatePost } from '../model/types';
import { MateIcon } from './MateIcon';
import { mateCategoryIcon, mateCategoryTint } from './mateCategoryStyle';

interface MatePostCardProps {
  post: MatePost;
  onOpen: () => void;
  onBookmark: () => void;
}

export function MatePostCard({ post, onOpen, onBookmark }: MatePostCardProps) {
  const isGroupBuy = post.category === 'GROUP_BUY';
  const feePerPerson = estimateFeePerPerson(post);
  const joined = post.participating === 'JOINED';
  const ratio = Math.min(post.nowParticipants / Math.max(post.maxParticipants, 1), 1);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${mateCategoryLabels[post.category]} 모집: ${post.title}`}
      className={[
        'flex gap-3 rounded-card bg-surface-card p-4 text-left shadow-glass ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]',
        'cursor-pointer transition-transform duration-[var(--duration-fast)] ease-irum-out active:scale-[0.985]',
        'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
        post.full && !joined ? 'opacity-60' : '',
      ].join(' ')}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      <span className={['inline-flex size-[46px] shrink-0 items-center justify-center rounded-[16px] ring-1 ring-inset ring-glass-edge', mateCategoryTint[post.category]].join(' ')}>
        <MateIcon name={mateCategoryIcon[post.category]} className="size-[22px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-caption font-bold text-primary-strong">{mateCategoryLabels[post.category]}</span>
          {joined ? (
            <span className="inline-flex h-5 items-center gap-0.5 rounded-pill bg-success-soft px-1.5 text-micro font-bold text-success">
              <MateIcon name="check" className="size-3" />참여 중
            </span>
          ) : null}
          <span className="ml-auto whitespace-nowrap text-micro text-fg-muted">{formatCreatedAt(post.createdAt)}</span>
          <button
            type="button"
            className="-my-3 -ml-1 -mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-pill focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            aria-label={post.bookmarked ? `즐겨찾기 해제: ${post.title}` : `즐겨찾기에 저장: ${post.title}`}
            aria-pressed={post.bookmarked}
            onClick={(event) => { event.stopPropagation(); onBookmark(); }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <MateIcon
              name="bookmark"
              className={['size-[22px] transition-[fill,color] duration-[var(--duration-base)]', post.bookmarked ? 'fill-primary text-fg-brand' : 'text-ink-500'].join(' ')}
            />
          </button>
        </div>
        <h3 className="truncate text-[16px] font-bold tracking-irum-tight text-fg-strong">{post.title}</h3>
        <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-caption text-fg-muted">
          {!isGroupBuy && post.place ? (
            <span className="inline-flex items-center gap-[3px]"><MateIcon name="map" className="size-3" />{post.place}</span>
          ) : null}
          {feePerPerson !== undefined ? (
            <span className="inline-flex items-center gap-[3px] font-bold text-fg-strong">
              <MateIcon name="wallet" className="size-3 text-fg-muted" />1인 {feePerPerson.toLocaleString('ko-KR')}원
            </span>
          ) : null}
          <span className="inline-flex items-center gap-[3px]">
            <MateIcon name="clock" className="size-3" />
            {isGroupBuy ? formatDeadline(post.deadlineAt) : formatShortDateTime(post.activityAt)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-pill bg-ink-100"
            role="progressbar"
            aria-label="모집 인원"
            aria-valuemin={0}
            aria-valuemax={post.maxParticipants}
            aria-valuenow={post.nowParticipants}
          >
            <div className="h-full rounded-pill bg-primary" style={{ width: `${ratio * 100}%` }} />
          </div>
          <span className="text-caption font-bold text-fg-brand">{post.nowParticipants}/{post.maxParticipants}명</span>
        </div>
      </div>
    </div>
  );
}
