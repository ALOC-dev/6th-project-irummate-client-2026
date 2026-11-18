import { useEffect, useId, useRef, useState } from 'react';

import { dateKey, monthCells, shiftMonth, toDateKey, WEEKDAY_LABELS, type YearMonth } from '@shared/lib';

import {
  earliestSlotAfter,
  formatDateTimeLabel,
  isNotFuture,
  pad2,
  parseDateTimeValue,
  toDateTimeValue,
} from '../model/dateTimeValue';
import { MateIcon } from './MateIcon';
import { WheelColumn } from './WheelColumn';

/** 분 바퀴의 간격(분). 1로 바꾸면 아이폰처럼 1분 단위가 된다. */
const MINUTE_STEP = 5;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => index * MINUTE_STEP);

interface DateTimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  errorMessage?: string;
  now?: Date;
}

/** 입력 마스크 대신 달력과 시간 칸에서 고르는 일시 입력. 값은 'YYYY-MM-DDTHH:mm'이다. */
export function DateTimeField({ label, value, onChange, open, onToggle, errorMessage, now = new Date() }: DateTimeFieldProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const parts = parseDateTimeValue(value);
  const todayKey = toDateKey(now);
  // 값이 없으면 다음 정시를 기본 시각으로 보여 준다.
  const fallbackHour = (now.getHours() + 1) % 24;

  const [date, setDate] = useState(parts?.date);
  const [hour, setHour] = useState(parts?.hour24 ?? fallbackHour);
  const [minute, setMinute] = useState(parts ? parts.minute - (parts.minute % MINUTE_STEP) : 0);
  const thisMonth: YearMonth = { year: now.getFullYear(), month: now.getMonth() };
  const [shown, setShown] = useState<YearMonth>(() => {
    if (!parts) return thisMonth;
    const [year = thisMonth.year, month = thisMonth.month + 1] = parts.date.split('-').map(Number);
    return { year, month: month - 1 };
  });
  const atFirstMonth = shown.year === thisMonth.year && shown.month === thisMonth.month;

  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [open]);

  const emit = (nextDate: string | undefined, nextHour: number, nextMinute: number) => {
    if (!nextDate) return;
    let hour24 = nextHour;
    let min = nextMinute;
    // 지나간 시각이면 오늘 고를 수 있는 가장 이른 칸으로 옮긴다(바퀴도 그 자리로 굴러간다).
    if (isNotFuture(nextDate, hour24, min, now)) {
      const slot = nextDate === todayKey ? earliestSlotAfter(now, MINUTE_STEP) : undefined;
      if (!slot) return;
      hour24 = slot.hour24;
      min = slot.minute;
      setHour(hour24);
      setMinute(min);
    }
    onChange(toDateTimeValue(nextDate, hour24, min));
  };

  const pickDate = (key: string) => { setDate(key); emit(key, hour, minute); };
  const pickHour = (next: number) => { setHour(next); emit(date, next, minute); };
  const pickMinute = (next: number) => { setMinute(next); emit(date, hour, next); };

  const isToday = date === todayKey;
  const hourClosed = (candidate: number) => isToday && isNotFuture(date ?? '', candidate, 60 - MINUTE_STEP, now);
  const minuteClosed = (candidate: number) => isToday && isNotFuture(date ?? '', hour, candidate, now);
  const todayFull = !earliestSlotAfter(now, MINUTE_STEP);

  const summary = formatDateTimeLabel(value);

  return (
    <div className="w-full">
      <span id={`${id}-label`} className="mb-2 block text-body-sm font-semibold text-fg-body">{label}</span>
      <button
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        className={[
          'flex h-12 w-full items-center gap-2.5 rounded-control bg-glass-input px-4 text-left text-body shadow-xs ring-1 ring-inset',
          'transition-[box-shadow] duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
          errorMessage ? 'ring-danger' : open ? 'ring-border-focus' : 'ring-border-subtle',
        ].join(' ')}
        onClick={onToggle}
      >
        <MateIcon name="calendar" className="size-[18px] shrink-0 text-fg-brand" />
        <span id={`${id}-value`} className={['min-w-0 flex-1 truncate', summary ? 'font-semibold text-fg-strong' : 'text-fg-subtle'].join(' ')}>
          {summary ?? '날짜와 시간을 골라 주세요'}
        </span>
        <MateIcon name="chevron-down" className={['size-[18px] shrink-0 text-fg-muted transition-transform duration-[var(--duration-base)]', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={`${id}-panel`}
          role="group"
          aria-label={`${label} 고르기`}
          className="mt-2 rounded-card bg-surface-card px-3 pb-3.5 pt-3 shadow-glass ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]"
        >
          <div className="mb-1.5 flex items-center justify-between pl-2">
            <p aria-live="polite" className="m-0 text-body font-bold tracking-irum-tight text-fg-strong">{shown.year}년 {shown.month + 1}월</p>
            <div className="flex">
              <button
                type="button"
                aria-label="이전 달"
                disabled={atFirstMonth}
                className="flex size-9 items-center justify-center rounded-pill text-fg-muted hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:opacity-30"
                onClick={() => setShown((current) => shiftMonth(current, -1))}
              >
                <MateIcon name="chevron-left" className="size-[18px]" />
              </button>
              <button
                type="button"
                aria-label="다음 달"
                className="flex size-9 items-center justify-center rounded-pill text-fg-muted hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                onClick={() => setShown((current) => shiftMonth(current, 1))}
              >
                <MateIcon name="chevron-right" className="size-[18px]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-micro font-semibold text-fg-subtle" aria-hidden="true">
            {WEEKDAY_LABELS.map((day, index) => (
              <span key={day} className={['py-1', index === 0 ? 'text-danger' : '', index === 6 ? 'text-fg-brand' : ''].join(' ')}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells(shown).map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const key = dateKey(shown.year, shown.month, day);
              const past = key < todayKey || (key === todayKey && todayFull);
              const selected = key === date;
              const today = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`${shown.month + 1}월 ${day}일`}
                  aria-pressed={selected}
                  aria-current={today ? 'date' : undefined}
                  disabled={past}
                  className="flex h-10 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed"
                  onClick={() => pickDate(key)}
                >
                  <span className={[
                    'flex size-8 items-center justify-center rounded-pill text-body-sm',
                    selected
                      ? 'bg-primary font-bold text-fg-on-brand shadow-brand'
                      : today
                        ? 'bg-primary-soft font-bold text-fg-link'
                        : past
                          ? 'text-fg-disabled opacity-40'
                          : ['font-medium', index % 7 === 0 ? 'text-danger' : 'text-fg-strong'].join(' '),
                  ].join(' ')}>
                    {day}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 border-t border-border-subtle pt-3">
            <p className="m-0 mb-1 pl-2 text-body-sm font-bold text-fg-strong">시간</p>
            {/* 아이폰처럼 가운데 줄을 두 바퀴에 걸친 띠 하나로 표시한다. */}
            <div className="relative flex items-center px-6">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-1/2 h-9 -translate-y-1/2 rounded-control bg-surface-icon" />
              <WheelColumn label="시" items={HOURS} value={hour} format={pad2} isDisabled={hourClosed} onChange={pickHour} />
              <span aria-hidden="true" className="relative px-1 text-title-3 font-bold text-fg-strong">:</span>
              <WheelColumn label="분" items={MINUTES} value={minute} format={pad2} isDisabled={minuteClosed} onChange={pickMinute} />
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? <p id={`${id}-error`} className="mt-2 text-caption text-danger">{errorMessage}</p> : null}
    </div>
  );
}
