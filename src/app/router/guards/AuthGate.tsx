import { Navigate, Outlet } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';
import { SessionStartErrorView } from '../SessionStartErrorView';

// 로그인 여부만 본다. 확인 중 화면(스플래시)은 나중에 더한다.
// 시작 시 확인이 연결 끊김·서버 오류로 실패하면 로그인으로 보내지 않고 다시 시도 화면을 띄운다.
export function AuthGate() {
  const session = useSession();

  if (session.startError) return <SessionStartErrorView session={session} />;
  if (session.status === 'loading') return null;
  if (session.status === 'anonymous') return <Navigate to={paths.login} replace />;
  return <Outlet />;
}
