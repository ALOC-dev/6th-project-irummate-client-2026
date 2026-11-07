import type { OnboardingStage } from '@features/auth';
import type { BuildTarget } from '@shared/config/env';

import { paths } from './paths';

// 임시: 가입 단계 → 첫 화면. 나중에 features/auth의 onboardingStage로 옮긴다.
// 가드와 EntryRedirect는 이 표만 보고 이동한다.
const STAGE_ENTRY: Record<OnboardingStage, string> = {
  login: paths.login,
  terms: paths.onboarding.terms,
  intro: paths.onboarding.intro,
  profile: paths.onboarding.profile,
  certification: paths.onboarding.certification,
  certified: paths.home,
  admin: paths.admin.home,
};

export function entryPathFor(stage: OnboardingStage, target: BuildTarget = 'app'): string {
  // 관리자 웹에는 관리자 화면만 있다. 일반 사용자 안내 후 로그아웃은 나중에 더한다.
  if (target === 'admin-web' && stage !== 'admin') return paths.login;
  return STAGE_ENTRY[stage];
}
