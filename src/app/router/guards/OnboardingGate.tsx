import { Navigate, Outlet, useLocation } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';
import { entryPathFor } from '../stageEntry';

// 가입 단계에 맞는 화면만 연다. 이미 끝낸 단계로 돌아가거나 건너뛸 수 없다.
// 단계별 허용 경로(예: profile 단계의 소개 다시 보기)는 나중에 판정 함수로 옮긴다.
export function OnboardingGate() {
  const { user } = useSession();
  const { pathname } = useLocation();

  if (!user) return <Navigate to={paths.login} replace />;
  const expected = entryPathFor(user.stage);
  if (pathname !== expected) return <Navigate to={expected} replace />;
  return <Outlet />;
}
