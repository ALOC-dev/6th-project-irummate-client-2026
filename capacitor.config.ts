import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // 스토어 등록 후에는 바꿀 수 없다. 결정 기록: docs/adr/0002-native-projects.md
  appId: 'com.irummate.app',
  appName: '이룸메이트',
  webDir: 'dist',
  plugins: {
    // 앱의 fetch·XHR을 네이티브 HTTP로 보내 재발급 쿠키를 네이티브 쪽이 관리하게 한다(토큰 재발급 ①).
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
