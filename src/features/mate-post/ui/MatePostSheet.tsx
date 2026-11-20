import type { ReactNode } from 'react';

import { Avatar, BottomSheet, Button } from '@shared/ui';

import { estimateFeePerPerson } from '../model/estimateFeePerPerson';
import { formatCreatedAt, formatShortDateTime } from '../model/formatDateTime';
import type { MatePost } from '../model/types';
import { MateIcon } from './MateIcon';

interface MatePostSheetProps {
  post: MatePost | null;
  onClose: () => void;
  onBookmark: () => void;
  onJoin: () => void;
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="m-0 font-semibold text-fg-strong">{children}</dd>
    </>
  );
}

export function MatePostSheet({ post, onClose, onBookmark, onJoin }: MatePostSheetProps) {
  if (!post) return null;

  const isGroupBuy = post.category === 'GROUP_BUY';
  const isMine = post.participating === 'MINE';
  const joined = post.participating === 'JOINED';
  const isFull = post.full || post.nowParticipants >= post.maxParticipants;
  const feePerPerson = estimateFeePerPerson(post);

  return (
    <BottomSheet
      open
      title={post.title}
      onClose={onClose}
      footer={joined ? (
        <Button variant="secondary" size="lg" fullWidth onClick={onJoin}>참여 취소</Button>
      ) : (
        <Button size="lg" fullWidth disabled={isMine || isFull} onClick={onJoin}>
          {isMine ? '내가 만든 모집이에요' : isFull ? '모집이 끝났어요' : <><MateIcon name="hand-heart" className="size-5" />참여하기</>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.authorNickname} size={36} decorative />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-body-sm font-bold text-fg-strong">{post.authorNickname}</p>
            <p className="m-0 text-caption text-fg-muted">모집자 · {formatCreatedAt(post.createdAt)}</p>
          </div>
          <button
            type="button"
            aria-pressed={post.bookmarked}
            className={[
              'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-glass-input px-4 text-body-sm font-bold ring-1 ring-inset ring-border-subtle',
              'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
              post.bookmarked ? 'text-primary-strong' : 'text-fg-body',
            ].join(' ')}
            onClick={onBookmark}
          >
            <MateIcon name="bookmark" className={['size-[18px]', post.bookmarked ? 'fill-primary text-fg-brand' : ''].join(' ')} />
            {post.bookmarked ? '저장됨' : '저장'}
          </button>
        </div>
        <dl className="m-0 grid grid-cols-[64px_1fr] gap-y-2 rounded-card bg-glass-soft px-4 py-3 text-body-sm ring-1 ring-inset ring-glass-edge">
          {!isGroupBuy && post.place ? <InfoRow label="장소">{post.place}</InfoRow> : null}
          {feePerPerson !== undefined ? (
            <InfoRow label="금액">
              <span className="flex flex-col gap-0.5">
                <span>1인 {feePerPerson.toLocaleString('ko-KR')}원</span>
                <span className="text-caption font-normal text-fg-muted">총 {post.estimatedFee?.toLocaleString('ko-KR')}원 · N빵</span>
              </span>
            </InfoRow>
          ) : null}
          <InfoRow label="인원">{post.nowParticipants} / {post.maxParticipants}명</InfoRow>
          <InfoRow label={isGroupBuy ? '수령' : '활동'}>{formatShortDateTime(post.activityAt)}</InfoRow>
          <InfoRow label="마감">{formatShortDateTime(post.deadlineAt)}</InfoRow>
        </dl>
      </div>
    </BottomSheet>
  );
}
