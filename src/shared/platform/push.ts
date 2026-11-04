import type { Unsubscribe } from './types';

export interface PushPayload {
  type: string;
  targetId?: string;
}

// 푸시 권한·기기 토큰·수신·탭 구독(앱 구현은 나중에 한다). 웹은 아무것도 하지 않는다.
// 토큰 서버 등록과 알림 종류 해석은 uukdo의 notification이 한다.
export const push = {
  async requestPermission(): Promise<'granted' | 'denied'> {
    return 'denied';
  },
  async getToken(): Promise<string | null> {
    return null;
  },
  onReceive(_handler: (payload: PushPayload) => void): Unsubscribe {
    return () => {};
  },
  onTap(_handler: (payload: PushPayload) => void): Unsubscribe {
    return () => {};
  },
};
