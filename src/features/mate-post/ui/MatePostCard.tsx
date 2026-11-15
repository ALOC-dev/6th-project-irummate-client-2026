import { GlassCard } from '@shared/ui';

import { estimateFeePerPerson } from '../model/estimateFeePerPerson';
import { formatCreatedAt, formatDateTime } from '../model/formatDateTime';
import { remainingParticipants } from '../model/recruitmentRules';
import { mateCategoryLabels, type MatePost } from '../model/types';
import { MateIcon } from './MateIcon';

const categoryTone: Record<MatePost['category'], string> = {
  MEAL: 'bg-warning-soft text-warning',
  HOBBY: 'bg-info-soft text-info',
  GROUP_BUY: 'bg-success-soft text-success',
  OTHER: 'bg-ink-100 text-fg-muted',
};

interface MatePostCardProps {
  post: MatePost;
  onOpen: () => void;
  onBookmark: () => void;
}

export function MatePostCard({ post, onOpen, onBookmark }: MatePostCardProps) {
  const isFull = post.full || post.nowParticipants >= post.maxParticipants;
  const hasOneSpotLeft = remainingParticipants(post) === 1;
  const feePerPerson = estimateFeePerPerson(post);

  return (
    <GlassCard padding="none" className={isFull ? 'opacity-60' : undefined}>
      <article className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={['rounded-pill px-2.5 py-1 text-caption font-bold', categoryTone[post.category]].join(' ')}>
              {mateCategoryLabels[post.category]}
            </span>
            <span className="truncate text-caption text-fg-subtle">{formatCreatedAt(post.createdAt)}</span>
          </div>
          <button
            type="button"
            className={[
              '-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-pill',
              'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
              post.bookmarked ? 'bg-primary-soft text-fg-brand' : 'text-fg-muted hover:bg-primary-soft',
            ].join(' ')}
            aria-label={post.bookmarked ? '즐겨찾기 해제' : '즐겨찾기에 저장'}
            aria-pressed={post.bookmarked}
            onClick={onBookmark}
          >
            <MateIcon name="bookmark" className={post.bookmarked ? 'size-5 fill-current' : 'size-5'} />
          </button>
        </div>

        <button type="button" className="mt-3 block w-full text-left" onClick={onOpen}>
          <h3 className="line-clamp-2 text-title-3 font-bold leading-6 tracking-irum-tight text-fg-strong">
            {post.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-body-sm text-fg-muted">
            {post.place ? <span className="inline-flex items-center gap-1.5"><MateIcon name="map" className="size-4" />{post.place}</span> : null}
            <span className="inline-flex items-center gap-1.5"><MateIcon name="clock" className="size-4" />{formatDateTime(post.activityAt)}</span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-border-subtle pt-4">
            <div>
              <p className="text-caption text-fg-subtle">{post.authorNickname}님의 모집</p>
              {feePerPerson !== undefined ? <p className="mt-0.5 text-body-sm font-bold text-fg-strong">1인 {feePerPerson.toLocaleString('ko-KR')}원 예상</p> : null}
            </div>
            <span className={[
              'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-bold',
              isFull
                ? 'bg-ink-100 text-fg-muted'
                : hasOneSpotLeft ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-fg-brand',
            ].join(' ')}>
              <MateIcon name="people" className="size-3.5" />
              {post.nowParticipants}/{post.maxParticipants}명
            </span>
          </div>
        </button>
      </article>
    </GlassCard>
  );
}
