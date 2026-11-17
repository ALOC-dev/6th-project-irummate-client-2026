import { useEffect, useRef, useState } from 'react';

const FADE_PX = 8;
const LOOP_GAP_PX = 40;
const HOLD_MS = 1400;
const MS_PER_PX = 30;
const MIN_TRAVEL_MS = 3000;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 양쪽 끝을 같은 폭으로 흐리게 지운다.
const FADE_MASK = `linear-gradient(to right, transparent 0, #000 ${FADE_PX}px, #000 calc(100% - ${FADE_PX}px), transparent 100%)`;

interface MarqueeTextProps {
  text: string;
  className?: string;
  /**
   * 왼쪽으로 FADE_PX만큼 넓혀서 멈춘 글자의 시작 위치를 다른 줄과 맞춘다.
   * 앞에 배지처럼 붙은 요소가 있으면 끄고, 그 요소와 글자 사이에 여백 경계를 둔다.
   */
  bleedLeft?: boolean;
}

/**
 * 한 줄에 다 들어가지 않는 글자를 잠깐 멈췄다가 왼쪽으로 흘려 보내고,
 * 끝이 지나가면 간격을 두고 처음이 다시 들어오도록 계속 돈다.
 * 움직임 줄이기 설정이면 움직이지 않고 말줄임표로 자른다.
 */
export function MarqueeText({ text, className, bleedLeft = true }: MarqueeTextProps) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    const first = firstRef.current;
    if (!box || !track || !first || reduced) return undefined;
    let animation: Animation | undefined;

    const update = () => {
      animation?.cancel();
      animation = undefined;
      const textWidth = first.scrollWidth;
      // 아직 그려지지 않았거나 숨겨진 상태(너비 0)면 넘치지 않은 것으로 본다.
      const over = box.clientWidth > 0 && textWidth - (box.clientWidth - FADE_PX * 2) > 1;
      setOverflowing(over);
      if (!over || typeof track.animate !== 'function') return;
      const distance = textWidth + LOOP_GAP_PX;
      const travel = Math.max(distance * MS_PER_PX, MIN_TRAVEL_MS);
      const total = travel + HOLD_MS;
      animation = track.animate(
        [
          { transform: 'translateX(0)', offset: 0 },
          { transform: 'translateX(0)', offset: HOLD_MS / total },
          { transform: `translateX(-${distance}px)`, offset: 1 },
        ],
        { duration: total, iterations: Infinity, easing: 'linear' },
      );
    };

    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : undefined;
    observer?.observe(box);
    return () => {
      observer?.disconnect();
      animation?.cancel();
    };
  }, [text, reduced]);

  if (reduced) {
    return <span className={['block min-w-0 truncate', className].filter(Boolean).join(' ')}>{text}</span>;
  }

  return (
    <span
      ref={boxRef}
      className={['block min-w-0 overflow-hidden px-2', bleedLeft ? '-mx-2' : '-mr-2', className].filter(Boolean).join(' ')}
      style={overflowing ? { WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK } : undefined}
    >
      <span ref={trackRef} className="inline-flex whitespace-nowrap will-change-transform">
        <span ref={firstRef}>{text}</span>
        {overflowing ? <span aria-hidden="true" style={{ paddingLeft: LOOP_GAP_PX }}>{text}</span> : null}
      </span>
    </span>
  );
}
