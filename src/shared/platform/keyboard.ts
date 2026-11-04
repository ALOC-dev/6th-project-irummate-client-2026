import type { Unsubscribe } from './types';

export interface KeyboardState {
  open: boolean;
  height: number;
}

// 키보드 열림·높이 구독. 웹은 화면 영역(visual viewport) 크기 변화로 계산한다.
export const keyboard = {
  onChange(handler: (state: KeyboardState) => void): Unsubscribe {
    const viewport = window.visualViewport;
    if (!viewport) return () => {};
    const listener = () => {
      const height = Math.max(0, window.innerHeight - viewport.height);
      handler({ open: height > 0, height });
    };
    viewport.addEventListener('resize', listener);
    return () => viewport.removeEventListener('resize', listener);
  },
};
