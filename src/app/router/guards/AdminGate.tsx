import { Navigate, Outlet } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';

// admin 단계만 통과한다. 화면을 나누는 용도이고 실제 권한은 서버가 관리자 API에서 검사한다.
export function AdminGate() {
  const { user } = useSession();

  if (user?.stage !== 'admin') return <Navigate to={paths.entry} replace />;
  return <Outlet />;
}
