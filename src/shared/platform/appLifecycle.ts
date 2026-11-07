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
    return onVisibility(true, handler);
  },
  onPause(handler: () => void): Unsubscribe {
    return onVisibility(false, handler);
  },
};
