// 가입 단계. 판정은 model/onboardingStage.ts가 한다.
// pending: 인증 심사 중. 앱 전체를 열고 매칭·채팅에서만 심사 중 안내를 띄운다(ADR 0004).
export type OnboardingStage =
  | 'login'
  | 'terms'
  | 'intro'
  | 'profile'
  | 'certification'
  | 'pending'
  | 'certified'
  | 'admin';

export interface SessionUser {
  id: number;
  name: string;
  dormRoom: string | null;
  stage: OnboardingStage;
}

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export interface Session {
  status: SessionStatus;
  user: SessionUser | null;
}
