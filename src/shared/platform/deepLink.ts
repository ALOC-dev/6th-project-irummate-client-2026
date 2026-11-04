import type { Unsubscribe } from './types';

// 앱을 연 주소 구독(카카오 콜백, 알림 링크). 웹은 브라우저가 직접 이동하므로 아무것도 하지 않는다.
export const deepLink = {
  onOpen(_handler: (url: string) => void): Unsubscribe {
    return () => {};
  },
};
