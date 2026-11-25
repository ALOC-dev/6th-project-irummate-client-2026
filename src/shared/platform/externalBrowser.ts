import { Browser } from '@capacitor/browser';

import { runtime } from './isNative';

function isHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// 외부 페이지 열기. http·https만 연다.
// 앱은 Android Custom Tabs·iOS 앱 안 브라우저(SFSafariViewController), 웹은 새 탭(열린 페이지가 원래 창을 조작하지 못하게).
export const externalBrowser = {
  async open(url: string): Promise<void> {
    if (!isHttpUrl(url)) throw new Error('http·https 주소만 열 수 있습니다.');
    if (runtime.isNative()) {
      await Browser.open({ url });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  // 앱 안 브라우저 닫기(카카오 로그인 후 앱으로 돌아왔을 때). 열려 있지 않으면 아무것도 하지 않는다. 웹은 닫을 수 없다.
  async close(): Promise<void> {
    if (!runtime.isNative()) return;
    try {
      await Browser.close();
    } catch {
      // 열린 창이 없을 때 플랫폼에 따라 실패로 끝난다. 닫을 것이 없다는 뜻이라 무시한다.
    }
  },
};
