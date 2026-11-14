import { BottomSheet, Button } from '@shared/ui';

import type { MatePost } from '../model/types';
import { MateIcon } from './MateIcon';

interface MatePostSheetProps {
  post: MatePost | null;
  onClose: () => void;
  onBookmark: () => void;
  onJoin: () => void;
}

export function MatePostSheet({ post, onClose, onBookmark, onJoin }: MatePostSheetProps) {
  const isFull = post ? post.currentMembers >= post.maxMembers : false;
  return (
    <BottomSheet
      open={Boolean(post)}
      title={post?.category ?? '모집 상세'}
      description={post ? `${post.host} · ${post.createdAtLabel}` : undefined}
      onClose={onClose}
      footer={post ? (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="w-14 px-0"
            aria-label={post.bookmarked ? '즐겨찾기 해제' : '즐겨찾기에 저장'}
            aria-pressed={post.bookmarked}
            onClick={onBookmark}
          >
            <MateIcon name="bookmark" className={post.bookmarked ? 'size-5 fill-current text-fg-brand' : 'size-5'} />
          </Button>
          <Button fullWidth disabled={isFull && !post.joined} onClick={onJoin}>
            {post.joined ? '참여 취소하기' : isFull ? '모집이 끝났어요' : '참여하기'}
          </Button>
        </div>
      ) : undefined}
    >
      {post ? (
        <div>
          <h3 className="text-title-2 font-bold leading-7 tracking-irum-tight text-fg-strong">{post.title}</h3>
          <div className="mt-4 grid gap-3 rounded-lg bg-glass-input p-4 text-body-sm text-fg-body ring-1 ring-inset ring-border-subtle">
            {post.place ? <p className="flex items-center gap-2"><MateIcon name="map" className="size-4 text-fg-muted" />{post.place}</p> : null}
            <p className="flex items-center gap-2"><MateIcon name="clock" className="size-4 text-fg-muted" />{post.schedule}</p>
            <p className="flex items-center gap-2"><MateIcon name="people" className="size-4 text-fg-muted" />현재 {post.currentMembers}명 · 최대 {post.maxMembers}명</p>
          </div>
          <section className="mt-6">
            <h4 className="text-body-sm font-bold text-fg-strong">모집 내용</h4>
            <p className="mt-2 whitespace-pre-line text-body leading-7 text-fg-body">{post.description}</p>
          </section>
          {post.price ? (
            <section className="mt-6 rounded-lg bg-primary-soft p-4">
              <p className="text-caption font-semibold text-fg-brand">공동구매 금액</p>
              <p className="mt-1 text-title-3 font-bold text-fg-strong">
                총 {post.price.toLocaleString('ko-KR')}원
              </p>
              <p className="mt-1 text-body-sm text-fg-muted">
                참여 인원에 따라 1인 금액이 달라질 수 있어요.
              </p>
            </section>
          ) : null}
        </div>
      ) : null}
    </BottomSheet>
  );
}
