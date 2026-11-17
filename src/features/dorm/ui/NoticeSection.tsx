import { GlassCard } from '@shared/ui';

import type { DormNotice } from '../model/types';
import { DormIcon } from './DormIcon';
import { MarqueeText } from './MarqueeText';
import { NewBadge } from './NoticeBadge';

interface NoticeSectionProps {
  notices: DormNotice[];
  refreshing: boolean;
  onRefresh: () => void;
  onOpen: (notice: DormNotice) => void;
}

export function NoticeSection({ notices, refreshing, onRefresh, onOpen }: NoticeSectionProps) {
  return (
    <section aria-labelledby="notice-heading">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center">
          <h2 id="notice-heading" className="m-0 text-[18px] font-bold text-fg-strong">기숙사 공지</h2>
          <button
            type="button"
            className={[
              'flex size-9 items-center justify-center rounded-pill bg-transparent',
              'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
              refreshing ? 'text-fg-brand' : 'text-fg-muted',
            ].join(' ')}
            aria-label="공지 새로고침"
            aria-busy={refreshing}
            onClick={onRefresh}
          >
            <DormIcon name="refresh" className={['size-4', refreshing ? 'animate-spin motion-reduce:animate-none' : ''].join(' ')} />
          </button>
        </div>
        <button type="button" className="rounded-pill text-[13px] font-semibold text-fg-link focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">
          전체보기
        </button>
      </div>
      <GlassCard padding="none" className="px-4 py-1">
        <ul className="m-0 list-none divide-y divide-border-subtle p-0">
          {notices.map((notice) => (
            <li key={notice.id}>
              <button
                type="button"
                className="w-full py-3 text-left focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                onClick={() => onOpen(notice)}
              >
                <span className="flex h-[22px] items-center">
                  {/* 배지 뒤 4px + 제목 상자 안쪽 8px(흐려지는 폭) = 배지와 제목 사이 경계 */}
                  {notice.isNew ? <span className="mr-1 flex shrink-0 items-center"><NewBadge /></span> : null}
                  <MarqueeText
                    text={notice.title}
                    bleedLeft={!notice.isNew}
                    className="flex-1 text-body font-semibold leading-[22px] text-fg-strong"
                  />
                  {/* 제목이 잘리는 곳과 날짜 사이 16px = 날짜와 카드 오른쪽 끝 사이 16px */}
                  <span className="shrink-0 pl-4 text-micro text-fg-subtle">{notice.postedAt}</span>
                </span>
                <span className="mt-0.5 block truncate text-caption text-fg-muted">{notice.source}</span>
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}
