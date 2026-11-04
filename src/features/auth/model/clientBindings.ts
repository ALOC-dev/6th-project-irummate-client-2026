import type { AuthHandlers } from '@shared/api';

import { authEvents } from './authEvents';
import { tokenStorage } from './tokenStorage';

// app/main.tsx가 registerAuthHandlers에 넘기는 함수 묶음. 통신 계층은 이것으로만 토큰에 닿는다.
export const authClientBindings: AuthHandlers = {
  getAccessToken: () => tokenStorage.get(),
  setAccessToken: (token) => tokenStorage.set(token),
  clearAccessToken: () => tokenStorage.clear(),
  onAuthExpired: () => authEvents.emit('expired'),
  onTokenRefreshed: () => authEvents.emit('tokenRefreshed'),
};

// 공개 계약: 채팅 소켓 연결에 쓰는 접근 토큰 읽기.
export async function getAccessToken(): Promise<string | null> {
  return tokenStorage.get();
}
