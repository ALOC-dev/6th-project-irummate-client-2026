// 1학기 src/api/client-api.js 이식. 차이: 토큰을 직접 읽지 않고 registerAuthHandlers로 주입받는다.
// shared는 feature를 import할 수 없기 때문이다. app/main.tsx가 시작 시 auth의 함수 묶음을 등록한다.
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@shared/config/env';

import { toAppError } from './errors';

export interface AuthHandlers {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  onAuthExpired: () => void;
  onTokenRefreshed: () => void;
}

const noopHandlers: AuthHandlers = {
  getAccessToken: () => null,
  setAccessToken: () => {},
  clearAccessToken: () => {},
  onAuthExpired: () => {},
  onTokenRefreshed: () => {},
};

let handlers: AuthHandlers = noopHandlers;

export function registerAuthHandlers(next: AuthHandlers): void {
  handlers = next;
}

// ① 일반 클라이언트: 요청마다 토큰 첨부, 401이면 재발급 후 1회 재시도
export const apiClient = axios.create({ baseURL: env.apiBaseUrl });

// ③ 공개용: 로그인 전 카카오 코드 교환용. 인터셉터 없음, 재발급 쿠키를 받는다.
export const publicClient = axios.create({ baseURL: env.apiBaseUrl, withCredentials: true });

// ② 재발급 전용: 인터셉터 없음. 재발급 요청은 여기 한 곳에서만 만든다(공개하지 않음).
// 앱 ①(네이티브 HTTP 쿠키)과 ②(응답 본문 + 보안 저장소)의 차이는 구현할 때 이 부분에만 둔다.
const refreshClient = axios.create({ baseURL: env.apiBaseUrl, withCredentials: true });

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 하도록 Promise를 공유한다.
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ data?: { accessToken?: string } }>('/api/auth/refresh')
      .then((response) => {
        const accessToken = response.data?.data?.accessToken;
        if (!accessToken) throw toAppError(new Error('재발급 응답에 접근 토큰이 없습니다.'));
        handlers.setAccessToken(accessToken);
        handlers.onTokenRefreshed();
        return accessToken;
      })
      .catch((error: unknown) => {
        // 401·403일 때만 로그아웃한다. 네트워크 끊김(터널·절전 복귀)으로는 로그인 화면으로 보내지 않는다.
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          handlers.clearAccessToken();
          handlers.onAuthExpired();
        }
        throw toAppError(error);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.request.use((config) => {
  const accessToken = handlers.getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !original) throw toAppError(error);

    // 이미 재발급 후 한 번 재시도한 요청이면 반복하지 않는다.
    if (original._retry) {
      handlers.clearAccessToken();
      handlers.onAuthExpired();
      throw toAppError(error);
    }

    original._retry = true;
    const accessToken = await refreshAccessToken();
    original.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(original);
  },
);
