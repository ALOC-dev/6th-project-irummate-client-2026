import { App } from '@capacitor/app';

import { runtime } from './isNative';
import { fromPluginListener } from './listen';
import type { Unsubscribe } from './types';

// 앱을 연 주소 구독(카카오 콜백, 알림 링크). 앱이 꺼진 상태에서 주소로 열린 경우도
// 플러그인이 첫 구독자에게 전달한다. 웹은 브라우저가 직접 이동하므로 아무것도 하지 않는다.
// 받은 주소는 그대로 믿지 않는다. 앱 경로로 바꾸고 내부 경로인지 확인하는 것은 PlatformBridge가 한다.
export const deepLink = {
  onOpen(handler: (url: string) => void): Unsubscribe {
    if (!runtime.isNative()) return () => {};
    return fromPluginListener(App.addListener('appUrlOpen', (event) => handler(event.url)));
  },
};
