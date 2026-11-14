import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { paths } from '@app/router/paths';
import { Button, EmptyState, FilterChip, IconButton } from '@shared/ui';

import { matePostFixtures } from '../model/fixtures';
import {
  mateCategories,
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
  전체: '✦', 밥: '●', 취미: '◆', 공동구매: '▣', 기타: '•••',
};

export function MateBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState(matePostFixtures);
  const [category, setCategory] = useState<MateCategoryFilter>('전체');
  const [sort, setSort] = useState<MateSort>('new');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [toast, setToast] = useState('');
  const selectedId = searchParams.get('post');
  const composeOpen = searchParams.get('compose') === '1';
  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;
  const overlayWasPushed = Boolean((location.state as { mateOverlay?: boolean } | null)?.mateOverlay);

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (category !== '전체' && post.category !== category) return false;
      if (bookmarkedOnly && !post.bookmarked) return false;
      return true;
    });
    if (sort === 'closing') {
      return [...filtered].sort((a, b) =>
        (a.maxMembers - a.currentMembers) - (b.maxMembers - b.currentMembers));
    }
    return filtered;
  }, [bookmarkedOnly, category, posts, sort]);

  const updatePost = (id: string, update: (post: MatePost) => MatePost) => {
    setPosts((current) => current.map((post) => post.id === id ? update(post) : post));
  };

  const toggleBookmark = (id: string) => {
    updatePost(id, (post) => ({ ...post, bookmarked: !post.bookmarked }));
  };

  const toggleJoin = (id: string) => {
    updatePost(id, (post) => ({
      ...post,
      joined: !post.joined,
      currentMembers: post.currentMembers + (post.joined ? -1 : 1),
    }));
    setToast(selectedPost?.joined ? '참여를 취소했어요.' : '참여했어요! 채팅방이 열릴 예정이에요.');
  };

  const createPost = (draft: MatePostDraft) => {
    const post: MatePost = {
      id: `local-${Date.now()}`,
      category: draft.category,
      title: draft.title.trim(),
      host: '이룸',
      createdAtLabel: '방금',
      place: draft.category === '공동구매' ? undefined : draft.place.trim(),
      schedule: draft.schedule.trim(),
      currentMembers: 1,
      maxMembers: draft.maxMembers,
      description: '새로 등록한 모집 글입니다. 상세 설명은 실제 작성 기능과 함께 확장할 예정이에요.',
      price: draft.price ? Number(draft.price) : undefined,
      priceMode: draft.category === '공동구매' ? 'split' : undefined,
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
    <main className="min-h-dvh pb-[var(--bottom-nav-clearance)] pt-[var(--safe-area-top)]">
      <h2 className="sr-only">MT-01 매이트</h2>
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-glass-bar [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center justify-between px-5">
          <div>
            <p className="text-caption font-semibold text-fg-brand">함께하면 더 즐거워요</p>
            <h1 className="text-title-1 font-extrabold tracking-irum-tight text-fg-strong">매이트</h1>
          </div>
          <div className="flex gap-1">
            <IconButton label="채팅 목록 열기" variant="ghost" onClick={() => navigate(paths.chats)}>
              <MateIcon name="chat" className="size-5" />
            </IconButton>
            <IconButton label="알림 설정 열기" variant="ghost" onClick={() => navigate(paths.notificationSettings)}>
              <MateIcon name="bell" className="size-5" />
            </IconButton>
          </div>
        </div>
      </header>

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
                {item}
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
                key={post.id}
                post={post}
                onOpen={() => navigate(paths.matePost(post.id), { state: { mateOverlay: true } })}
                onBookmark={() => toggleBookmark(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-card bg-surface-card shadow-glass">
            <EmptyState
              icon={<MateIcon name="search" className="size-6" />}
              title={bookmarkedOnly ? '저장한 모집 글이 없어요' : '조건에 맞는 모집 글이 없어요'}
              description={bookmarkedOnly ? '관심 있는 모집 글의 북마크를 눌러 저장해 보세요.' : '다른 카테고리를 선택해 보세요.'}
              action={<Button variant="secondary" size="sm" onClick={() => { setCategory('전체'); setBookmarkedOnly(false); }}>전체 모집 보기</Button>}
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
        onBookmark={() => selectedPost && toggleBookmark(selectedPost.id)}
        onJoin={() => selectedPost && toggleJoin(selectedPost.id)}
      />
      <MateComposeOverlay open={composeOpen} onClose={closeOverlay} onSubmit={createPost} />

      <div
        className={[
          'pointer-events-none fixed bottom-[calc(var(--bottom-nav-clearance)+1rem)] left-1/2 z-50 -translate-x-1/2 rounded-pill bg-glass-dark px-4 py-2.5 text-body-sm font-semibold text-fg-on-brand shadow-lg transition-opacity',
          toast ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        role="status"
        aria-live="polite"
        onTransitionEnd={() => toast && window.setTimeout(() => setToast(''), 1800)}
      >
        {toast}
      </div>
    </main>
  );
}
