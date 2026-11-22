import { Navigate, Outlet } from 'react-router';

import { useSession, type OnboardingStage } from '@features/auth';

import { paths } from '../paths';
import { entryPathFor } from '../stageEntry';

// 앱 본 화면은 certified와 pending(인증 심사 중) 단계가 연다(ADR 0004).
// pending의 매칭·채팅 심사 중 안내는 각 화면이 단계를 보고 띄운다.
const OPEN_STAGES: readonly OnboardingStage[] = ['certified', 'pending'];

export function CertifiedGate() {
  const { user } = useSession();

  if (!user) return <Navigate to={paths.login} replace />;
  if (!OPEN_STAGES.includes(user.stage)) return <Navigate to={entryPathFor(user.stage)} replace />;
  return <Outlet />;
}
