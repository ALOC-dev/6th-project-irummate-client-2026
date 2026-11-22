import type { OnboardingStage } from '@features/auth';
import type { BuildTarget } from '@shared/config/env';

import { paths } from './paths';

// 가입 단계 → 첫 화면, 가입 단계 → 열 수 있는 가입 화면.
// 단계 판정은 features/auth의 onboardingStage가 하고, 화면 경로는 app만 알기 때문에 이 표는 app에 둔다
// (feature는 app의 경로 표 외에 app을 import할 수 없음). 가드와 EntryRedirect는 이 표만 보고 이동한다.
const STAGE_ENTRY: Record<OnboardingStage, string> = {
  login: paths.login,
  terms: paths.onboarding.terms,
  intro: paths.onboarding.intro,
  profile: paths.onboarding.profile,
  certification: paths.onboarding.certification,
  pending: paths.home,
  certified: paths.home,
  admin: paths.admin.home,
};

// 가입 화면(OnboardingGate 안쪽) 중 단계별로 열 수 있는 것. 빈 목록이면 가입 화면을 하나도 열 수 없다.
// 이미 끝낸 단계로 되돌아가거나 다음 단계로 건너뛰는 것을 막는다. 예외는 기본 정보 단계의 소개 다시 보기 하나다.
const STAGE_ONBOARDING_PATHS: Record<OnboardingStage, readonly string[]> = {
  login: [],
  terms: [paths.onboarding.terms],
  intro: [paths.onboarding.intro],
  profile: [paths.onboarding.profile, paths.onboarding.intro],
  certification: [paths.onboarding.certification],
  pending: [],
  certified: [],
  admin: [],
};

export function entryPathFor(stage: OnboardingStage, target: BuildTarget = 'app'): string {
  // 관리자 웹에는 관리자 화면만 있다. 일반 사용자 안내 후 로그아웃은 나중에 더한다.
  if (target === 'admin-web' && stage !== 'admin') return paths.login;
  return STAGE_ENTRY[stage];
}

export function canOpenOnboardingPath(stage: OnboardingStage, pathname: string): boolean {
  return STAGE_ONBOARDING_PATHS[stage].includes(pathname);
}

// 로그인 후 가려던 경로로 돌려보내도 되는 단계인지. 앱 본 화면을 열 수 있는 단계(certified·pending)와,
// 관리자 화면 안의 경로를 가려던 관리자만 돌려보낸다. 가입 중인 사용자는 단계 첫 화면으로 간다.
export function canReturnTo(stage: OnboardingStage, path: string): boolean {
  if (stage === 'certified' || stage === 'pending') return !path.startsWith(paths.admin.home);
  if (stage === 'admin') return path === paths.admin.home || path.startsWith(`${paths.admin.home}/`);
  return false;
}
