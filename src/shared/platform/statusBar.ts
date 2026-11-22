import { StatusBar, Style } from '@capacitor/status-bar';

import { runtime } from './isNative';

export interface StatusBarOptions {
  // 화면 배경 기준. light: 밝은 배경 위 어두운 글자, dark: 어두운 배경 위 밝은 글자
  style: 'light' | 'dark';
  // true면 화면을 상태바 아래까지 그린다. 여백은 레이아웃에서만 넣는다.
  overlay?: boolean;
}

// 상태바 글자색·화면 겹침 설정. 웹은 아무것도 하지 않는다.
export const statusBar = {
  async configure(options: StatusBarOptions): Promise<void> {
    if (!runtime.isNative()) return;
    await StatusBar.setStyle({ style: options.style === 'light' ? Style.Light : Style.Dark });
    if (options.overlay === undefined) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: options.overlay });
    } catch {
      // Android 15 이상은 항상 상태바 아래까지 그려 이 설정을 받지 않는다.
    }
  },
};
