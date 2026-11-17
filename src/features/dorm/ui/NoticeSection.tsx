import { GlassCard } from '@shared/ui';

import type { DormNotice } from '../model/types';
import { DormIcon } from './DormIcon';
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
                className="w-full py-3.5 text-left focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                onClick={() => onOpen(notice)}
              >
                <span className="mb-1 flex items-center gap-1.5">
                  {notice.isNew ? <NewBadge /> : null}
                  <span className="ml-auto text-micro text-fg-subtle">{notice.postedAt}</span>
                </span>
                <span className="block text-body font-semibold leading-[22px] text-fg-strong">{notice.title}</span>
                <span className="mt-0.5 block text-caption text-fg-muted">{notice.source}</span>
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}
