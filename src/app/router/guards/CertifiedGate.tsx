import { Navigate, Outlet } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';
import { entryPathFor } from '../stageEntry';

// certified 단계만 통과한다. 인증 심사 중 처리(결정 항목)는 나중에 더한다.
export function CertifiedGate() {
  const { user } = useSession();

  if (!user) return <Navigate to={paths.login} replace />;
  if (user.stage !== 'certified') return <Navigate to={entryPathFor(user.stage)} replace />;
  return <Outlet />;
}
