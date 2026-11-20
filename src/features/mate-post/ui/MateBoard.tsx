import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { paths } from '@app/router/paths';
import { EmptyState, FilterChip, GlassCard, IconButton, PageHeader, Toast } from '@shared/ui';

import { matePostFixtures } from '../model/fixtures';
import { compareDeadlineAt, isRecruitmentOpen } from '../model/recruitmentRules';
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
import { MateCategoryIcon } from './MateCategoryIcon';
import { MatePostCard } from './MatePostCard';
import { MatePostSheet } from './MatePostSheet';

const SORTS: Array<[MateSort, string]> = [['new', '최신순'], ['closing', '마감 임박순']];

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
      if (!isRecruitmentOpen(post)) return false;
      if (post.full && post.participating === 'NONE') return false;
      if (category !== 'ALL' && post.category !== category) return false;
      if (bookmarkedOnly && !post.bookmarked) return false;
      return true;
    });
    if (sort === 'closing') {
      return [...filtered].sort(compareDeadlineAt);
    }
    return filtered;
  }, [bookmarkedOnly, category, posts, sort]);

  const updatePost = (id: string, update: (post: MatePost) => MatePost) => {
    setPosts((current) => current.map((post) =>
      String(post.recruitmentId) === id ? update(post) : post));
  };

  const toggleBookmark = (id: string) => {
    const target = posts.find((post) => String(post.recruitmentId) === id);
    if (!target) return;
    updatePost(id, (post) => ({ ...post, bookmarked: !post.bookmarked }));
    setToast(target.bookmarked ? '즐겨찾기에서 해제했어요' : '즐겨찾기에 저장했어요');
  };

  const bookmarkCount = posts.filter((post) => post.bookmarked).length;
  const emptyTitle = bookmarkedOnly
    ? bookmarkCount ? '이 카테고리에 저장한 글이 없어요' : '저장한 모집 글이 없어요'
    : '조건에 맞는 모집 글이 없어요';
  const emptyDescription = bookmarkedOnly
    ? bookmarkCount ? '다른 카테고리를 선택하거나 즐겨찾기 필터를 꺼보세요' : '모집 카드의 북마크를 눌러 관심 있는 글을 저장해 보세요'
    : '다른 카테고리를 선택해 보세요';

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
    const leaving = selectedPost?.participating === 'JOINED';
    closeOverlay();
    setToast(leaving ? '참여를 취소했어요' : '참여했어요! 단체 채팅방이 열렸어요');
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
    setToast('모집 글을 올렸어요');
  };

  const closeOverlay = () => {
    if (overlayWasPushed) navigate(-1);
    else navigate(paths.mate, { replace: true });
  };

  return (
    <main className="min-h-dvh pb-[var(--bottom-nav-clearance)]">
      <h2 className="sr-only">MT-01 매이트</h2>
      <PageHeader
        title={<img src="/brand/mate-wordmark-blue.png" alt="매이트" className="block h-[var(--wordmark-height)] w-auto" />}
        actions={(
          <>
            <IconButton label="검색" variant="ghost" size="sm" onClick={() => setToast('검색은 준비 중이에요')}>
              <MateIcon name="search" className="size-[22px] text-fg-strong" />
            </IconButton>
            <IconButton label="채팅" variant="ghost" size="sm" onClick={() => navigate(paths.chats)}>
              <MateIcon name="chat" className="size-[22px] text-fg-brand" />
            </IconButton>
          </>
        )}
      />

      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pb-6 pt-4">
        <div className="-mx-5 -mb-9 -mt-3 flex gap-2 overflow-x-auto px-5 pb-9 pt-3 [scrollbar-width:none]" role="group" aria-label="매이트 카테고리">
          {mateCategories.map((item) => (
            <FilterChip
              key={item}
              selected={category === item}
              leading={item === 'ALL' ? undefined : <MateCategoryIcon category={item} className="size-[18px]" />}
              onClick={() => setCategory(item)}
            >
              {mateCategoryLabels[item]}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <div role="tablist" aria-label="정렬" className="flex h-11 gap-1 rounded-pill bg-glass-soft p-1 ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]">
            {SORTS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={sort === key}
                className={[
                  'flex-1 rounded-pill text-body-sm transition-[background-color,box-shadow,color] duration-[var(--duration-base)]',
                  'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
                  sort === key ? 'bg-surface-card font-bold text-fg-brand shadow-sm' : 'font-semibold text-fg-muted',
                ].join(' ')}
                onClick={() => setSort(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 text-[13px] font-semibold text-fg-muted">{bookmarkedOnly ? '저장한 글' : '모집 글'} {visiblePosts.length}개</p>
            <button
              type="button"
              aria-pressed={bookmarkedOnly}
              className={[
                'inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-3.5 text-[13px] font-bold',
                'transition-[background-color,color,box-shadow] duration-[var(--duration-base)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
                bookmarkedOnly
                  ? 'bg-primary text-fg-on-brand shadow-brand'
                  : 'bg-surface-card text-fg-body shadow-xs ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]',
              ].join(' ')}
              onClick={() => setBookmarkedOnly((value) => !value)}
            >
              <MateIcon name="bookmark" className={['size-4', bookmarkedOnly ? 'fill-current' : ''].join(' ')} />
              즐겨찾기만 보기
            </button>
          </div>
        </div>

        {visiblePosts.length ? (
          <div className="flex flex-col gap-3">
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
          <GlassCard padding="none">
            <EmptyState
              icon={<MateIcon name={bookmarkedOnly ? 'bookmark' : 'search'} className="size-[26px]" />}
              title={emptyTitle}
              description={emptyDescription}
            />
          </GlassCard>
        )}
      </div>

      <button
        type="button"
        aria-label="모집하기"
        className={[
          'fixed bottom-[calc(var(--bottom-nav-clearance)+12px)] right-[max(20px,calc(50vw-220px))] z-30 flex size-[62px] items-center justify-center rounded-pill',
          'bg-primary text-fg-on-brand shadow-brand transition-transform duration-[var(--duration-fast)] active:scale-90',
          'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
        ].join(' ')}
        onClick={() => navigate(paths.mateCompose, { state: { mateOverlay: true } })}
      >
        <MateIcon name="pencil" className="size-7" />
      </button>

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
