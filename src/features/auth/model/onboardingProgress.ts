// 서버가 모르는 가입 진행 표시 두 가지. 단계 판정(onboardingStage)의 두 번째 입력이다.
// 둘 다 민감 정보가 아니고, 토큰은 여기 두지 않는다.
import type { OnboardingProgress } from './onboardingStage';

// 소개 완료 표시: 사용자별로 이 기기에 남긴다(localStorage).
// 저장소를 쓸 수 없으면(사생활 보호 모드 등) 소개를 한 번 더 보여 줄 뿐이라 오류는 무시한다.
const INTRO_KEY_PREFIX = 'irummate.introCompleted.';

function introKey(userId: string): string {
  return `${INTRO_KEY_PREFIX}${userId}`;
}

export const introProgress = {
  isCompleted(userId: string): boolean {
    try {
      return window.localStorage.getItem(introKey(userId)) === 'true';
    } catch {
      return false;
    }
  },
  markCompleted(userId: string): void {
    try {
      window.localStorage.setItem(introKey(userId), 'true');
    } catch {
      // 저장하지 못하면 다음 실행에서 소개가 한 번 더 나온다.
    }
  },
  clear(userId: string): void {
    try {
      window.localStorage.removeItem(introKey(userId));
    } catch {
      // 지울 수 없으면 지울 것도 없다.
    }
  },
};

// 약관 동의 표시: 서버에 동의 필드가 생기기 전까지 이번 실행 동안만 메모리에 둔다(ADR 0004 결정 2).
let termsAgreedUserId: string | null = null;

export const termsProgress = {
  isAgreed(userId: string): boolean {
    return termsAgreedUserId === userId;
  },
  markAgreed(userId: string): void {
    termsAgreedUserId = userId;
  },
  clear(): void {
    termsAgreedUserId = null;
  },
};

export function readOnboardingProgress(userId: string): OnboardingProgress {
  return {
    introCompleted: introProgress.isCompleted(userId),
    termsAgreedInSession: termsProgress.isAgreed(userId),
  };
}
