import type { CSSProperties } from 'react';

export type BrandIconName = 'meal' | 'gamepad' | 'cart' | 'bot' | 'office' | 'shield';

const SRC: Record<BrandIconName, string> = {
  meal: '/brand/icon-meal.png',
  gamepad: '/brand/icon-gamepad.png',
  cart: '/brand/icon-cart.png',
  bot: '/brand/icon-bot.svg',
  office: '/brand/icon-office.svg',
  shield: '/brand/icon-shield.svg',
};

// 모양이 한쪽으로 쏠린 아이콘은 눈으로 보기에 가운데로 오도록 옮긴다.
// 카트: 무게중심이 캔버스 중심보다 약 4% 오른쪽이라 그만큼 왼쪽으로.
const OPTICAL_SHIFT: Partial<Record<BrandIconName, string>> = {
  cart: 'translateX(-4%)',
};

export interface BrandIconProps {
  name: BrandIconName;
  className?: string;
}

/**
 * public/brand의 아이콘 모양만 쓰고 색은 글자색(currentColor)을 따른다.
 * 선택된 칩에서는 흰색, 쨍한 타일 위에서도 흰색, 일반 칩에서는 본문 색으로 보인다.
 */
export function BrandIcon({ name, className }: BrandIconProps) {
  const image = `url(${SRC[name]})`;
  const style: CSSProperties = {
    WebkitMaskImage: image,
    maskImage: image,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    transform: OPTICAL_SHIFT[name],
  };

  return (
    <span
      aria-hidden="true"
      data-brand-icon={name}
      className={['inline-block shrink-0 bg-current', className].filter(Boolean).join(' ')}
      style={style}
    />
  );
}
