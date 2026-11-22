import { App } from '@capacitor/app';

import { runtime } from './isNative';
import { fromPluginListener } from './listen';
import type { Unsubscribe } from './types';

let unsubscribeCurrent: Unsubscribe | null = null;

// Android 뒤로가기 버튼 구독. 처리 함수는 하나만 둔다(새로 등록하면 이전 것을 해제).
// 처리 함수가 있는 동안에는 Android 기본 동작(웹뷰 뒤로가기)이 꺼지고 처리 함수가 대신한다.
// iOS·웹에는 하드웨어 버튼이 없어 아무것도 하지 않는다.
export const backButton = {
  subscribe(handler: () => void): Unsubscribe {
    if (runtime.platform() !== 'android') return () => {};
    unsubscribeCurrent?.();
    const unsubscribe = fromPluginListener(App.addListener('backButton', () => handler()));
    const release: Unsubscribe = () => {
      unsubscribe();
      if (unsubscribeCurrent === release) unsubscribeCurrent = null;
    };
    unsubscribeCurrent = release;
    return release;
  },
  // 앱 종료(Android 홈에서 뒤로가기 두 번). iOS·웹에서는 아무것도 하지 않는다.
  async exitApp(): Promise<void> {
    if (runtime.platform() !== 'android') return;
    await App.exitApp();
  },
};
