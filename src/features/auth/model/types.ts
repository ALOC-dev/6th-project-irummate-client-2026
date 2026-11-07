// 가입 단계. 판정은 나중에 model/onboardingStage.ts가 한다.
export type OnboardingStage = 'login' | 'terms' | 'intro' | 'profile' | 'certification' | 'certified' | 'admin';

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
