import { App } from '@capacitor/app';

import { runtime } from './isNative';
import { fromPluginListener } from './listen';
import type { Unsubscribe } from './types';

function onVisibility(visible: boolean, handler: () => void): Unsubscribe {
  const listener = () => {
    if ((document.visibilityState === 'visible') === visible) handler();
  };
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
}

// 앱 복귀·백그라운드 전환 구독. 웹은 화면 표시 상태 변경으로 대신한다.
export const appLifecycle = {
  onResume(handler: () => void): Unsubscribe {
    if (!runtime.isNative()) return onVisibility(true, handler);
    return fromPluginListener(App.addListener('resume', () => handler()));
  },
  onPause(handler: () => void): Unsubscribe {
    if (!runtime.isNative()) return onVisibility(false, handler);
    return fromPluginListener(App.addListener('pause', () => handler()));
  },
};
