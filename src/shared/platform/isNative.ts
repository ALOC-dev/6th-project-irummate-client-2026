import { Capacitor } from '@capacitor/core';

export type PlatformName = 'web' | 'android' | 'ios';

// 현재 앱(Android·iOS)에서 도는지 판별한다. 웹과 테스트에서는 항상 웹이다.
export const runtime = {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },
  platform(): PlatformName {
    const name = Capacitor.getPlatform();
    return name === 'android' || name === 'ios' ? name : 'web';
  },
};
