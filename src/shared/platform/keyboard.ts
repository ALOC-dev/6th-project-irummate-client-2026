import { Keyboard } from '@capacitor/keyboard';

import { runtime } from './isNative';
import { fromPluginListener } from './listen';
import type { Unsubscribe } from './types';

export interface KeyboardState {
  open: boolean;
  /**
   * 키보드가 화면을 실제로 가리는 높이(px). 키보드 자체의 높이가 아니다.
   * 하단 고정 요소에 여백이 필요하면 이 값만큼만 준다. 키보드 높이를 따로 더하지 않는다.
   * - 앱: 키보드가 열리면 웹뷰가 줄어 가리는 부분이 없으므로 항상 0이다(capacitor.config.ts의 Keyboard.resize).
   * - 웹: 화면 영역(visual viewport)이 줄어든 만큼이다.
   */
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

// 키보드 열림·가려진 높이 구독. 앱은 키보드 플러그인(열리기 직전·닫히기 직전), 웹은 화면 영역(visual viewport) 크기 변화로 계산한다.
// 앱에서 플러그인이 주는 keyboardHeight는 키보드 자체의 높이라 넘기지 않는다. 웹뷰가 이미 그만큼 줄어서 여백으로 쓰면 두 번 밀린다.
export const keyboard = {
  onChange(handler: (state: KeyboardState) => void): Unsubscribe {
    if (!runtime.isNative()) return onViewportChange(handler);
    const offShow = fromPluginListener(Keyboard.addListener('keyboardWillShow', () => handler({ open: true, height: 0 })));
    const offHide = fromPluginListener(
      Keyboard.addListener('keyboardWillHide', () => handler({ open: false, height: 0 })),
    );
    return () => {
      offShow();
      offHide();
    };
  },
};
