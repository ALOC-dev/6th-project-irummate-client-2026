import { Navigate, Outlet, useLocation } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';
import { canOpenOnboardingPath, entryPathFor } from '../stageEntry';

// 가입 단계에 맞는 화면만 연다. 이미 끝낸 단계로 돌아가거나 건너뛸 수 없다.
// 단계별로 열 수 있는 화면은 stageEntry의 표가 정한다(예: 기본 정보 단계의 소개 다시 보기).
// 가입을 마쳤으면(certified·pending) 단계 첫 화면인 홈으로 간다.
export function OnboardingGate() {
  const { user } = useSession();
  const { pathname } = useLocation();

  if (!user) return <Navigate to={paths.login} replace />;
  if (!canOpenOnboardingPath(user.stage, pathname)) return <Navigate to={entryPathFor(user.stage)} replace />;
  return <Outlet />;
}
