import { useEffect, useRef, type KeyboardEvent } from 'react';

const ITEM_PX = 36;
const PAD_ROWS = 2; // 가운데 줄 위아래로 보이는 줄 수(보이는 줄은 2 + 1 + 2 = 5줄)
const SETTLE_MS = 110;
const FADE_MASK = 'linear-gradient(to bottom, transparent 0, #000 34%, #000 66%, transparent 100%)';

interface WheelColumnProps {
  label: string;
  items: number[];
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
  isDisabled?: (value: number) => boolean;
}

/**
 * 아이폰 시간 선택처럼 위아래로 굴려서 가운데 줄에 멈춘 값을 고르는 바퀴.
 * 항목을 누르거나 키보드 위·아래 화살표로도 고를 수 있다.
 */
export function WheelColumn({ label, items, value, onChange, format, isDisabled }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(false);
  const index = Math.max(items.indexOf(value), 0);

  // 값이 바뀌면 그 줄이 가운데에 오도록 굴린다. 처음 그릴 때는 애니메이션 없이 바로 맞춘다.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const top = index * ITEM_PX;
    if (Math.abs(list.scrollTop - top) < 1) { mounted.current = true; return; }
    if (typeof list.scrollTo === 'function') list.scrollTo({ top, behavior: mounted.current ? 'smooth' : 'auto' });
    else list.scrollTop = top;
    mounted.current = true;
  }, [index]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const onScroll = () => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const list = listRef.current;
      if (!list) return;
      const landed = items[Math.min(Math.max(Math.round(list.scrollTop / ITEM_PX), 0), items.length - 1)];
      if (landed !== undefined && landed !== value) onChange(landed);
    }, SETTLE_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    // 막힌 항목은 건너뛰고 그 방향의 다음 항목으로 간다.
    for (let at = index + step; at >= 0 && at < items.length; at += step) {
      const next = items[at];
      if (next !== undefined && !isDisabled?.(next)) { onChange(next); return; }
    }
  };

  return (
    <div className="relative flex-1">
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        className="relative snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-control focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] [scrollbar-width:none]"
        style={{ height: ITEM_PX * (PAD_ROWS * 2 + 1), WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        <div aria-hidden="true" style={{ height: ITEM_PX * PAD_ROWS }} />
        {items.map((item) => {
          const selected = item === value;
          const disabled = isDisabled?.(item) ?? false;
          return (
            <div
              key={item}
              role="option"
              aria-selected={selected}
              aria-disabled={disabled || undefined}
              className={[
                'flex snap-center items-center justify-center tabular-nums transition-[color,font-size] duration-[var(--duration-fast)]',
                selected ? 'text-title-3 font-bold text-fg-strong' : 'text-body text-fg-muted',
                disabled ? 'opacity-30' : 'cursor-pointer',
              ].join(' ')}
              style={{ height: ITEM_PX }}
              onClick={() => { if (!disabled) onChange(item); }}
            >
              {format(item)}
            </div>
          );
        })}
        <div aria-hidden="true" style={{ height: ITEM_PX * PAD_ROWS }} />
      </div>
    </div>
  );
}
