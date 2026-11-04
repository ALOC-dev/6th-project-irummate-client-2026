import type { Unsubscribe } from './types';

// Android 뒤로가기 버튼 구독(앱 구현은 나중에 한다). iOS·웹에는 하드웨어 버튼이 없어 아무것도 하지 않는다.
export const backButton = {
  subscribe(_handler: () => void): Unsubscribe {
    return () => {};
  },
};
