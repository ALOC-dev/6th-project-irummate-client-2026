import { GlassCard } from '@shared/ui';

import type { DormNotice } from '../model/types';
import { DormIcon } from './DormIcon';
import { NewBadge } from './NoticeBadge';

interface LatestNoticeCardProps {
  notice: DormNotice;
  onOpen: (notice: DormNotice) => void;
}

export function LatestNoticeCard({ notice, onOpen }: LatestNoticeCardProps) {
  return (
    <GlassCard padding="none" className="shadow-md transition-transform duration-[var(--duration-fast)] ease-irum-out active:scale-[0.985]">
      <button
        type="button"
        className="block w-full rounded-card px-4 pb-3 pt-3.5 text-left focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        aria-label={`최신 공지: ${notice.title} 원문 보기`}
        onClick={() => onOpen(notice)}
      >
        <span className="mb-1.5 flex items-center gap-1.5">
          <NewBadge />
          <span className="text-caption text-fg-subtle">{notice.source} · {notice.postedAt}</span>
        </span>
        <span className="block text-title-3 font-bold leading-6 tracking-irum-tight text-fg-strong">{notice.title}</span>
        <span className="mt-0.5 flex justify-end">
          <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-fg-brand">
            원문 보기<DormIcon name="chevron-right" className="size-4" />
          </span>
        </span>
      </button>
    </GlassCard>
  );
}
