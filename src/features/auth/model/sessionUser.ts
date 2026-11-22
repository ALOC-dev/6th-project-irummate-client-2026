import type { AuthStatusUser } from './authStatus';
import type { OnboardingStage, SessionUser } from './types';

// 판정용 사용자 + 판정한 단계 → 화면용 세션 사용자.
export function toSessionUser(user: AuthStatusUser, stage: OnboardingStage): SessionUser {
  return { id: user.id, nickname: user.nickname, dormRoom: null, stage };
}
