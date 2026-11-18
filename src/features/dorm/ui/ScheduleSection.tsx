import { useMemo, useState } from 'react';

import { GlassCard } from '@shared/ui';

import { dateKey, emptyLabel, groupByDate, monthCells, selectedLabel, shiftMonth, toDateKey } from '../model/calendar';
import type { DormEvent, DormEventCategory } from '../model/types';
import { DormIcon } from './DormIcon';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MAX_DOTS = 3;

const CATEGORY_COLOR: Record<DormEventCategory, string> = {
  신청: 'bg-sun-400',
  점검: 'bg-info',
  행사: 'bg-mint-400',
  생활: 'bg-primary',
};

function dayClass(isSelected: boolean, isToday: boolean, isSunday: boolean): string {
  if (isSelected) return 'bg-primary font-bold text-fg-on-brand';
  if (isToday) return 'bg-primary-soft font-bold text-fg-link';
  return ['bg-transparent font-medium', isSunday ? 'text-danger' : 'text-fg-strong'].join(' ');
}

interface ScheduleSectionProps {
  events: DormEvent[];
  today: Date;
}

export function ScheduleSection({ events, today }: ScheduleSectionProps) {
  const todayKey = toDateKey(today);
  const [yearMonth, setYearMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(todayKey);
  const byDate = useMemo(() => groupByDate(events), [events]);
  const selectedEvents = byDate.get(selected) ?? [];
  const { year, month } = yearMonth;

  return (
    <section aria-labelledby="schedule-heading">
      <h2 id="schedule-heading" className="m-0 mb-3 text-[18px] font-bold text-fg-strong">기숙사 일정</h2>
      <GlassCard padding="none" className="px-3.5 py-4">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <h3 aria-live="polite" className="m-0 text-title-3 font-bold tracking-irum-tight text-fg-strong">{year}년 {month + 1}월</h3>
          <div className="flex gap-0.5">
            {([['chevron-left', '이전 달', -1], ['chevron-right', '다음 달', 1]] as const).map(([icon, label, amount]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-pill bg-transparent text-ink-500 hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                onClick={() => setYearMonth((current) => shiftMonth(current, amount))}
              >
                <DormIcon name={icon} className="size-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center text-micro font-semibold text-fg-subtle" aria-hidden="true">
          {WEEKDAYS.map((day, index) => (
            <span key={day} className={['py-1', index === 0 ? 'text-danger' : '', index === 6 ? 'text-fg-brand' : ''].join(' ')}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {monthCells(yearMonth).map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />;
            const key = dateKey(year, month, day);
            const dayEvents = byDate.get(key) ?? [];
            const isSelected = key === selected;
            return (
              <button
                key={key}
                type="button"
                aria-label={`${month + 1}월 ${day}일${dayEvents.length ? `, 일정 ${dayEvents.length}개` : ''}`}
                aria-pressed={isSelected}
                aria-current={key === todayKey ? 'date' : undefined}
                className="flex h-11 flex-col items-center justify-center gap-[3px] rounded-sm bg-transparent p-0 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                onClick={() => setSelected(key)}
              >
                <span className={['flex size-8 items-center justify-center rounded-pill text-body-sm', dayClass(isSelected, key === todayKey, index % 7 === 0)].join(' ')}>
                  {day}
                </span>
                <span className="flex h-1 gap-0.5" aria-hidden="true">
                  {dayEvents.slice(0, MAX_DOTS).map((event) => (
                    <span key={event.id} className={['size-1 rounded-pill', CATEGORY_COLOR[event.category]].join(' ')} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex flex-col gap-2.5 border-t border-border-subtle pt-3">
          <h3 className="m-0 px-1 text-[13px] font-bold text-fg-muted">{selectedLabel(selected, todayKey)}</h3>
          {selectedEvents.length ? (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {selectedEvents.map((event) => (
                <li key={event.id} className="flex items-center gap-2.5 px-1">
                  <span className={['min-h-9 w-1 self-stretch rounded-pill', CATEGORY_COLOR[event.category]].join(' ')} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-body font-semibold text-fg-strong">{event.title}</p>
                    {event.detail ? <p className="m-0 mt-0.5 text-caption text-fg-muted">{event.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 px-1 pb-1 pt-0.5 text-body-sm text-fg-subtle">{emptyLabel(events, selected, todayKey)}</p>
          )}
        </div>
      </GlassCard>
    </section>
  );
}
