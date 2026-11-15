import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { paths } from '@app/router/paths';
import { Button, EmptyState, FilterChip, IconButton, PageHeader, Toast } from '@shared/ui';

import { matePostFixtures } from '../model/fixtures';
import {
  mateCategories,
  mateCategoryLabels,
  type MateCategoryFilter,
  type MatePost,
  type MatePostDraft,
  type MateSort,
} from '../model/types';
import { MateComposeOverlay } from './MateComposeOverlay';
import { MateIcon } from './MateIcon';
import { MatePostCard } from './MatePostCard';
import { MatePostSheet } from './MatePostSheet';

const categorySymbol: Record<MateCategoryFilter, string> = {
  ALL: '✦', MEAL: '●', HOBBY: '◆', GROUP_BUY: '▣', OTHER: '•••',
};

export function MateBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState(matePostFixtures);
  const [category, setCategory] = useState<MateCategoryFilter>('ALL');
  const [sort, setSort] = useState<MateSort>('new');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [toast, setToast] = useState('');
  const selectedId = searchParams.get('post');
  const composeOpen = searchParams.get('compose') === '1';
  const selectedPost = posts.find((post) => String(post.recruitmentId) === selectedId) ?? null;
  const overlayWasPushed = Boolean((location.state as { mateOverlay?: boolean } | null)?.mateOverlay);

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (category !== 'ALL' && post.category !== category) return false;
      if (bookmarkedOnly && !post.bookmarked) return false;
      return true;
    });
    if (sort === 'closing') {
      return [...filtered].sort((a, b) =>
        new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime());
    }
    return filtered;
  }, [bookmarkedOnly, category, posts, sort]);

  const updatePost = (id: string, update: (post: MatePost) => MatePost) => {
    setPosts((current) => current.map((post) =>
      String(post.recruitmentId) === id ? update(post) : post));
  };

  const toggleBookmark = (id: string) => {
    updatePost(id, (post) => ({ ...post, bookmarked: !post.bookmarked }));
  };

  const toggleJoin = (id: string) => {
    if (selectedPost?.participating === 'MINE') return;
    updatePost(id, (post) => ({
      ...post,
      participating: post.participating === 'JOINED' ? 'NONE' : 'JOINED',
      nowParticipants: post.nowParticipants + (post.participating === 'JOINED' ? -1 : 1),
      full: post.participating === 'JOINED'
        ? false
        : post.nowParticipants + 1 >= post.maxParticipants,
    }));
    setToast(selectedPost?.participating === 'JOINED'
      ? '참여를 취소했어요.'
      : '참여했어요! 채팅방이 열릴 예정이에요.');
  };

  const createPost = (draft: MatePostDraft) => {
    const post: MatePost = {
      recruitmentId: Date.now(),
      category: draft.category,
      title: draft.title.trim(),
      content: draft.content.trim(),
      status: 'OPEN',
      authorNickname: '이룸',
      place: draft.category === 'GROUP_BUY' ? undefined : draft.place.trim(),
      activityAt: draft.activityAt,
      deadlineAt: draft.deadlineAt,
      nowParticipants: 1,
      maxParticipants: draft.maxParticipants + 1,
      full: false,
      createdAt: new Date().toISOString(),
      participating: 'MINE',
      estimatedFee: draft.estimatedFee ? Number(draft.estimatedFee) : undefined,
      bookmarked: false,
    };
    setPosts((current) => [post, ...current]);
    closeOverlay();
    setToast('모집 글을 올렸어요.');
  };

  const closeOverlay = () => {
    if (overlayWasPushed) navigate(-1);
    else navigate(paths.mate, { replace: true });
  };

  return (
    <main className="min-h-dvh pb-[var(--bottom-nav-clearance)]">
      <h2 className="sr-only">MT-01 매이트</h2>
      <PageHeader
        title="매이트"
        titleSize="page"
        eyebrow="함께하면 더 즐거워요"
        actions={(
          <>
            <IconButton label="채팅 목록 열기" variant="ghost" onClick={() => navigate(paths.chats)}>
              <MateIcon name="chat" className="size-5" />
            </IconButton>
            <IconButton label="알림 설정 열기" variant="ghost" onClick={() => navigate(paths.notificationSettings)}>
              <MateIcon name="bell" className="size-5" />
            </IconButton>
          </>
        )}
      />

      <div className="mx-auto w-full max-w-[480px] px-5 pb-6 pt-5">
        <section aria-label="매이트 카테고리">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {mateCategories.map((item) => (
              <FilterChip
                key={item}
                selected={category === item}
                leading={categorySymbol[item]}
                onClick={() => setCategory(item)}
              >
                {mateCategoryLabels[item]}
              </FilterChip>
            ))}
          </div>
        </section>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-body-sm font-semibold text-fg-muted">모집 글 {visiblePosts.length}개</p>
          <div className="flex gap-2">
            <button
              type="button"
              className={[
                'inline-flex h-10 items-center gap-1.5 rounded-pill px-3 text-caption font-bold',
                'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
                bookmarkedOnly ? 'bg-primary text-fg-on-brand shadow-brand' : 'bg-surface-card text-fg-body shadow-xs',
              ].join(' ')}
              aria-pressed={bookmarkedOnly}
              onClick={() => setBookmarkedOnly((value) => !value)}
            >
              <MateIcon name="bookmark" className={bookmarkedOnly ? 'size-4 fill-current' : 'size-4'} />
              저장
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-surface-card px-3 text-caption font-bold text-fg-body shadow-xs focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
              onClick={() => setSort((value) => value === 'new' ? 'closing' : 'new')}
            >
              <MateIcon name="sort" className="size-4" />
              {sort === 'new' ? '최신순' : '마감 임박순'}
            </button>
          </div>
        </div>

        {visiblePosts.length ? (
          <div className="mt-4 grid gap-3">
            {visiblePosts.map((post) => (
              <MatePostCard
                key={post.recruitmentId}
                post={post}
                onOpen={() => navigate(paths.matePost(String(post.recruitmentId)), { state: { mateOverlay: true } })}
                onBookmark={() => toggleBookmark(String(post.recruitmentId))}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-card bg-surface-card shadow-glass">
            <EmptyState
              icon={<MateIcon name="search" className="size-6" />}
              title={bookmarkedOnly ? '저장한 모집 글이 없어요' : '조건에 맞는 모집 글이 없어요'}
              description={bookmarkedOnly ? '관심 있는 모집 글의 북마크를 눌러 저장해 보세요.' : '다른 카테고리를 선택해 보세요.'}
              action={<Button variant="secondary" size="sm" onClick={() => { setCategory('ALL'); setBookmarkedOnly(false); }}>전체 모집 보기</Button>}
            />
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed bottom-[calc(var(--bottom-nav-clearance)+0.75rem)] left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 px-5">
        <Button
          size="lg"
          className="pointer-events-auto ml-auto rounded-pill px-5"
          onClick={() => navigate(paths.mateCompose, { state: { mateOverlay: true } })}
        >
          <MateIcon name="plus" className="size-5" />
          모집하기
        </Button>
      </div>

      <MatePostSheet
        post={selectedPost}
        onClose={closeOverlay}
        onBookmark={() => selectedPost && toggleBookmark(String(selectedPost.recruitmentId))}
        onJoin={() => selectedPost && toggleJoin(String(selectedPost.recruitmentId))}
      />
      <MateComposeOverlay open={composeOpen} onClose={closeOverlay} onSubmit={createPost} />

      <Toast open={Boolean(toast)} position="above-nav" onDismiss={() => setToast('')}>
        {toast}
      </Toast>
    </main>
  );
}
