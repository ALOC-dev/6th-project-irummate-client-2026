import { Navigate, Outlet } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';

// 로그인 여부만 본다. 확인 중 화면(스플래시)은 나중에 더한다.
export function AuthGate() {
  const { status } = useSession();

  if (status === 'loading') return null;
  if (status === 'anonymous') return <Navigate to={paths.login} replace />;
  return <Outlet />;
}
