import { useMemo, useState } from 'react';

import { GlassCard, IconButton } from '@shared/ui';

import type { DormEvent } from '../model/types';
import { DormIcon } from './DormIcon';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const eventTone: Record<DormEvent['category'], string> = {
  생활: 'bg-primary', 점검: 'bg-warning', 행사: 'bg-success',
};

function dateKey(year: number, month: number, date: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

export function ScheduleSection({ events }: { events: DormEvent[] }) {
  const [yearMonth, setYearMonth] = useState({ year: 2026, month: 10 });
  const [selected, setSelected] = useState('2026-11-14');
  const { year, month } = yearMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array<null>(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const selectedEvents = events.filter((event) => event.date === selected);
  const eventDates = useMemo(() => new Set(events.map((event) => event.date)), [events]);
  const selectedDate = Number(selected.slice(-2));

  const moveMonth = (amount: number) => {
    const next = new Date(year, month + amount, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();
    setYearMonth({ year: nextYear, month: nextMonth });
    setSelected(dateKey(nextYear, nextMonth, 1));
  };

  return (
    <section className="mt-8" aria-labelledby="schedule-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="schedule-heading" className="text-title-3 font-bold text-fg-strong">생활관 일정</h2>
        <span className="inline-flex items-center gap-1 text-caption font-semibold text-fg-muted"><DormIcon name="calendar" className="size-4" />일정 {events.length}개</span>
      </div>
      <GlassCard>
        <div className="flex items-center justify-between">
          <IconButton label="이전 달" size="sm" variant="ghost" onClick={() => moveMonth(-1)}><DormIcon name="chevron-left" className="size-5" /></IconButton>
          <h3 className="text-body font-bold text-fg-strong">{year}년 {month + 1}월</h3>
          <IconButton label="다음 달" size="sm" variant="ghost" onClick={() => moveMonth(1)}><DormIcon name="chevron-right" className="size-5" /></IconButton>
        </div>
        <div className="mt-4 grid grid-cols-7 text-center">
          {WEEKDAYS.map((day) => <span key={day} className="py-2 text-caption font-semibold text-fg-subtle">{day}</span>)}
          {cells.map((day, index) => day ? (
            <button
              key={`${year}-${month}-${day}`}
              type="button"
              className={[
                'relative mx-auto my-0.5 flex size-10 items-center justify-center rounded-pill text-body-sm font-semibold',
                'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
                selected === dateKey(year, month, day) ? 'bg-primary text-fg-on-brand shadow-brand' : 'text-fg-body hover:bg-primary-soft',
              ].join(' ')}
              aria-label={`${month + 1}월 ${day}일`}
              aria-pressed={selected === dateKey(year, month, day)}
              onClick={() => setSelected(dateKey(year, month, day))}
            >
              {day}
              {eventDates.has(dateKey(year, month, day)) ? <span className="absolute bottom-1 size-1 rounded-pill bg-current" /> : null}
            </button>
          ) : <span key={`empty-${index}`} />)}
        </div>
      </GlassCard>

      <div className="mt-3">
        <h3 className="mb-2 px-1 text-body-sm font-bold text-fg-strong">{month + 1}월 {selectedDate}일 일정</h3>
        {selectedEvents.length ? selectedEvents.map((event) => (
          <GlassCard key={event.id} padding="sm" className="mb-2 flex items-start gap-3">
            <span className={['mt-1 size-2.5 shrink-0 rounded-pill', eventTone[event.category]].join(' ')} />
            <div>
              <p className="text-body-sm font-bold text-fg-strong">{event.title}</p>
              <p className="mt-1 text-caption leading-5 text-fg-muted">{event.detail}</p>
            </div>
          </GlassCard>
        )) : (
          <GlassCard padding="sm"><p className="py-3 text-center text-body-sm text-fg-muted">등록된 일정이 없어요.</p></GlassCard>
        )}
      </div>
    </section>
  );
}
