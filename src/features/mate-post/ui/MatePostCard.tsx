import { estimateFeePerPerson } from '../model/estimateFeePerPerson';
import { formatCreatedAt, formatDeadline, formatShortDateTime } from '../model/formatDateTime';
import { mateCategoryLabels, type MatePost } from '../model/types';
import { MateIcon } from './MateIcon';
import { MateCategoryIcon } from './MateCategoryIcon';

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
  // 한 자리만 남은 글은 빨간색으로 눈에 띄게 한다.
  const lastSpot = post.maxParticipants - post.nowParticipants === 1;

  return (
    <div
      className={[
        'relative flex items-center gap-3 rounded-card bg-surface-card px-4 py-3.5 text-left shadow-glass ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]',
        'transition-transform duration-[var(--duration-fast)] ease-irum-out active:scale-[0.985]',
        post.full && !joined ? 'opacity-60' : '',
      ].join(' ')}
    >
      {/* 카드 전체를 덮는 투명 열기 버튼. 즐겨찾기 버튼은 이 버튼의 형제로 두고 위(z-[1])에 올린다. */}
      <button
        type="button"
        aria-label={`${mateCategoryLabels[post.category]} 모집: ${post.title}`}
        className="absolute inset-0 rounded-card focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        onClick={onOpen}
      />
      <span className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-[16px] bg-surface-icon text-fg-brand shadow-xs">
        <MateCategoryIcon category={post.category} className="size-[25px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="min-w-0 flex-1 truncate text-[16px] font-bold tracking-irum-tight text-fg-strong">{post.title}</h3>
          <span className="shrink-0 whitespace-nowrap text-micro text-fg-muted">{formatCreatedAt(post.createdAt)}</span>
          <button
            type="button"
            className="relative z-[1] -my-3 -ml-1 -mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-pill focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            aria-label={post.bookmarked ? `즐겨찾기 해제: ${post.title}` : `즐겨찾기에 저장: ${post.title}`}
            aria-pressed={post.bookmarked}
            onClick={onBookmark}
          >
            <MateIcon
              name="bookmark"
              className={['size-[22px] transition-[fill,color] duration-[var(--duration-base)]', post.bookmarked ? 'fill-primary text-fg-brand' : 'text-ink-500'].join(' ')}
            />
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-caption text-fg-muted">
          {joined ? (
            <span className="inline-flex h-5 items-center gap-0.5 rounded-pill bg-success-soft px-1.5 text-micro font-bold text-success">
              <MateIcon name="check" className="size-3" />참여 중
            </span>
          ) : null}
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
        <div className="mt-2 flex items-center gap-2.5">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-pill bg-ink-100"
            role="progressbar"
            aria-label="모집 인원"
            aria-valuemin={0}
            aria-valuemax={post.maxParticipants}
            aria-valuenow={post.nowParticipants}
          >
            <div className={['h-full rounded-pill', lastSpot ? 'bg-danger' : 'bg-primary'].join(' ')} style={{ width: `${ratio * 100}%` }} />
          </div>
          <span className={['text-caption font-bold', lastSpot ? 'text-danger' : 'text-fg-brand'].join(' ')}>
            {post.nowParticipants}/{post.maxParticipants}명
            {lastSpot ? <span className="sr-only">, 한 자리 남음</span> : null}
          </span>
        </div>
      </div>
    </div>
  );
}
