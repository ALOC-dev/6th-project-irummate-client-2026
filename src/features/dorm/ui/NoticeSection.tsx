import { GlassCard } from '@shared/ui';

import type { DormNotice } from '../model/types';

const categoryTone: Record<DormNotice['category'], string> = {
  '생활 안내': 'bg-primary-soft text-fg-brand',
  시설: 'bg-info-soft text-info',
  안전: 'bg-danger-soft text-danger',
  행사: 'bg-success-soft text-success',
};

export function NoticeSection({ notices }: { notices: DormNotice[] }) {
  const [latest, ...rest] = notices;
  if (!latest) return null;

  return (
    <section aria-labelledby="notice-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="notice-heading" className="text-title-3 font-bold text-fg-strong">생활관 공지</h2>
        <button type="button" className="h-10 rounded-pill px-3 text-body-sm font-semibold text-fg-brand focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">전체 보기</button>
      </div>
      <GlassCard className="overflow-hidden bg-primary text-fg-on-brand shadow-brand ring-0">
        <span className="rounded-pill bg-glass-on-brand px-2.5 py-1 text-caption font-bold">{latest.category}</span>
        <h3 className="mt-4 text-title-2 font-bold leading-7 tracking-irum-tight">{latest.title}</h3>
        <p className="mt-3 text-body-sm text-fg-on-brand">생활관 홈페이지에서 확인한 최신 공지예요 · {latest.postedAt}</p>
      </GlassCard>
      <GlassCard padding="none" className="mt-3 overflow-hidden">
        <ul className="divide-y divide-border-subtle">
          {rest.map((notice) => (
            <li key={notice.id}>
              <button type="button" className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">
                <span className={['shrink-0 rounded-pill px-2.5 py-1 text-caption font-bold', categoryTone[notice.category]].join(' ')}>{notice.category}</span>
                <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-fg-strong">{notice.title}</span>
                {notice.isNew ? <span className="size-2 shrink-0 rounded-pill bg-primary" aria-label="새 공지" /> : <span className="shrink-0 text-micro text-fg-subtle">{notice.postedAt}</span>}
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}
