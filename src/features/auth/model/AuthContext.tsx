import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isAppError, refreshAccessToken } from '@shared/api';

import { fetchAuthStatus } from '../api/authApi';
import { createAuthOperationCoordinator } from './authOperationCoordinator';
import { authEvents } from './authEvents';
import { readOnboardingProgress } from './onboardingProgress';
import { getOnboardingStage } from './onboardingStage';
import { toSessionUser } from './sessionUser';
import { tokenStorage } from './tokenStorage';
import type { Session, SessionStartError, SessionUser } from './types';

export const AuthContext = createContext<Session | null>(null);

type SessionState = Pick<Session, 'status' | 'user' | 'startError'>;

const loading: SessionState = { status: 'loading', user: null };
const anonymous: SessionState = { status: 'anonymous', user: null };

// 서버 상태 → 판정 → 화면용 사용자. 판정 규칙은 onboardingStage 한 곳에만 있다.
async function loadSessionUser(): Promise<SessionUser | null> {
  // 앱을 다시 열면 메모리의 접근 토큰이 비어 있다. 기기에서 불러오는 단계 없이 재발급으로 채운다.
  // 로그인 완료 중에는 새 토큰이 이미 들어 있어 재발급하지 않는다.
  if (!tokenStorage.get()) await refreshAccessToken();
  const user = await fetchAuthStatus();
  if (!user) return null;
  return toSessionUser(user, getOnboardingStage(user, readOnboardingProgress(user.id)));
}

// 로그인 여부와 상관없는 실패(연결 끊김, 서버 오류)만 고른다. 이때는 로그아웃하지 않고 다시 시도를 기다린다.
function startErrorOf(error: unknown): SessionStartError | null {
  if (!isAppError(error)) return 'server';
  if (error.kind === 'network') return 'network';
  if (error.kind === 'server') return 'server';
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(loading);

  // 렌더마다 새로 만들지 않도록 처음 한 번만 만든다(StrictMode의 이중 실행에서도 같은 것을 쓴다).
  const [coordinator] = useState(() =>
    createAuthOperationCoordinator<SessionUser>({
      commitAuthenticated: (user) => {
        if (user) {
          setState({ status: 'authenticated', user });
          return;
        }
        // 재발급은 됐는데 서버가 비로그인이라고 하면(탈퇴 직후 등) 토큰을 버린다.
        tokenStorage.clear();
        setState(anonymous);
      },
      // 토큰만 바뀌었고 사용자는 그대로다.
      commitTokenRefreshed: () => {},
      commitUnauthenticated: () => setState(anonymous),
      commitBootstrapFailed: (error) => {
        const startError = startErrorOf(error);
        setState(startError ? { ...loading, startError } : anonymous);
      },
      loadCurrentUser: loadSessionUser,
      removeAccessToken: () => tokenStorage.clear(),
      setAccessToken: (accessToken) => tokenStorage.set(accessToken),
    }),
  );

  const start = useCallback(() => {
    // 실패는 commitBootstrapFailed가 상태로 남긴다. 여기서는 처리하지 않은 거부만 막는다.
    coordinator.bootstrap().catch(() => {});
  }, [coordinator]);

  const retry = useCallback(() => {
    setState(loading);
    start();
  }, [start]);

  useEffect(() => {
    start();
    const unsubscribeExpired = authEvents.subscribe('expired', coordinator.handleAuthExpired);
    const unsubscribeRefreshed = authEvents.subscribe('tokenRefreshed', coordinator.handleTokenRefreshed);
    return () => {
      unsubscribeExpired();
      unsubscribeRefreshed();
    };
  }, [coordinator, start]);

  const session = useMemo<Session>(
    () => (state.startError ? { ...state, retry } : { status: state.status, user: state.user }),
    [state, retry],
  );
  // 로그인 완료(coordinator.completeLogin)는 다음 작업의 로그인 훅에서 같은 feature 안의 Context로 연결한다.
  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}
