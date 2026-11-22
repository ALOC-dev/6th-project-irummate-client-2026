import { Keyboard } from '@capacitor/keyboard';

import { runtime } from './isNative';
import { fromPluginListener } from './listen';
import type { Unsubscribe } from './types';

export interface KeyboardState {
  open: boolean;
  height: number;
}

function onViewportChange(handler: (state: KeyboardState) => void): Unsubscribe {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  const listener = () => {
    const height = Math.max(0, window.innerHeight - viewport.height);
    handler({ open: height > 0, height });
  };
  viewport.addEventListener('resize', listener);
  return () => viewport.removeEventListener('resize', listener);
}

// 키보드 열림·높이 구독. 앱은 키보드 플러그인(열리기 직전·닫히기 직전), 웹은 화면 영역(visual viewport) 크기 변화로 계산한다.
export const keyboard = {
  onChange(handler: (state: KeyboardState) => void): Unsubscribe {
    if (!runtime.isNative()) return onViewportChange(handler);
    const offShow = fromPluginListener(
      Keyboard.addListener('keyboardWillShow', (info) => handler({ open: true, height: info.keyboardHeight })),
    );
    const offHide = fromPluginListener(
      Keyboard.addListener('keyboardWillHide', () => handler({ open: false, height: 0 })),
    );
    return () => {
      offShow();
      offHide();
    };
  },
};
