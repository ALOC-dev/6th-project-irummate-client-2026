import { GlassCard } from '@shared/ui';

import type { DormNotice } from '../model/types';
import { DormIcon } from './DormIcon';

interface NoticeSectionProps {
  notices: DormNotice[];
  refreshing: boolean;
  onRefresh: () => void;
}

export function NoticeSection({ notices, refreshing, onRefresh }: NoticeSectionProps) {
  const [latest] = notices;
  if (!latest) return null;

  return (
    <section aria-labelledby="notice-heading" className="contents">
      <GlassCard padding="none" className="cursor-pointer px-4 pb-3 pt-3.5 shadow-md">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="inline-flex h-[22px] items-center rounded-pill bg-danger-hover px-2 text-micro font-bold tracking-wide text-fg-on-brand">NEW</span>
          <span className="text-caption text-fg-subtle">{latest.source} · {latest.postedAt}</span>
        </div>
        <h3 className="text-title-3 font-bold leading-6 tracking-irum-tight text-fg-strong">{latest.title}</h3>
        <div className="mt-0.5 flex justify-end">
          <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-fg-brand">원문 보기<DormIcon name="chevron-right" className="size-4" /></span>
        </div>
      </GlassCard>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <h2 id="notice-heading" className="text-[18px] font-bold text-fg-strong">기숙사 공지</h2>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-pill text-fg-muted focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:opacity-50"
              aria-label="공지 새로고침"
              disabled={refreshing}
              onClick={onRefresh}
            >
              <DormIcon name="refresh" className={refreshing ? 'size-4 animate-spin motion-reduce:animate-none' : 'size-4'} />
            </button>
          </div>
          <button type="button" className="h-10 rounded-pill px-1 text-[13px] font-semibold text-fg-brand focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">전체보기</button>
        </div>
        <GlassCard padding="none" className="overflow-hidden px-4 py-1">
        <ul className="divide-y divide-border-subtle">
          {notices.map((notice) => (
            <li key={notice.id}>
              <button type="button" className="w-full py-3.5 text-left focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">
                <span className="mb-1 flex items-center gap-1.5">
                  {notice.isNew ? <span className="inline-flex h-[22px] items-center rounded-pill bg-danger-hover px-2 text-micro font-bold tracking-wide text-fg-on-brand">NEW</span> : null}
                  <span className="ml-auto text-micro text-fg-subtle">{notice.postedAt}</span>
                </span>
                <span className="block text-body font-semibold leading-[22px] text-fg-strong">{notice.title}</span>
                <span className="mt-0.5 block text-caption text-fg-muted">{notice.source}</span>
              </button>
            </li>
          ))}
        </ul>
        </GlassCard>
      </div>
    </section>
  );
}
