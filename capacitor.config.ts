import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // 임시 앱 ID. 스토어 등록 후에는 바꿀 수 없으므로 팀이 확정한 뒤 android/를 만든다.
  appId: 'com.irummate.app',
  appName: '이룸메이트',
  webDir: 'dist',
};

export default config;
