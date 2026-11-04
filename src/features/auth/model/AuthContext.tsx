import { createContext, useEffect, useState, type ReactNode } from 'react';

import { apiClient, refreshAccessToken, unwrap, type ApiEnvelope } from '@shared/api';

import { authEvents } from './authEvents';
import type { OnboardingStage, Session, SessionUser } from './types';

export const AuthContext = createContext<Session | null>(null);

const STAGES: readonly OnboardingStage[] = ['login', 'terms', 'intro', 'profile', 'certification', 'certified', 'admin'];

// 임시: MSW 세션 응답이 계약의 세션 사용자 모양을 그대로 준다.
// 나중에 서버 응답 모양 → sessionUser 변환 + onboardingStage 판정으로 바꾼다.
function readSessionUser(raw: unknown): SessionUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<SessionUser>;
  if (typeof value.id !== 'number' || typeof value.name !== 'string') return null;
  if (!value.stage || !STAGES.includes(value.stage)) return null;
  return { id: value.id, name: value.name, dormRoom: value.dormRoom ?? null, stage: value.stage };
}

const anonymous: Session = { status: 'anonymous', user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: 'loading', user: null });

  useEffect(() => {
    let cancelled = false;

    // 시작 시 재발급을 먼저 한 번 시도한다. 기기에서 토큰을 불러오는 단계는 없다.
    async function start() {
      try {
        await refreshAccessToken();
        const response = await apiClient.get<ApiEnvelope<unknown>>('/api/auth/status');
        const user = readSessionUser(unwrap(response.data));
        if (!cancelled) setSession(user ? { status: 'authenticated', user } : anonymous);
      } catch {
        // 임시: 모든 실패를 비로그인으로 본다. 네트워크 실패 시 재시도는 나중에 더한다.
        if (!cancelled) setSession(anonymous);
      }
    }

    void start();
    const unsubscribe = authEvents.subscribe('expired', () => setSession(anonymous));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}
