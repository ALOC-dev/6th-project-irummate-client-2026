import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useSession } from '@features/auth';

import { paths } from '../paths';
import { returnPath } from '../returnPath';
import { SessionSplash } from '../SessionSplash';
import { SessionStartErrorView } from '../SessionStartErrorView';

// 비로그인이면 가려던 경로를 기억하고 로그인으로 보낸다. 로그인을 마치면 EntryRedirect가 그 경로로 돌려보낸다.
// 세션이 만료돼 로그인으로 가는 경우도 같다(다시 로그인하면 보던 화면으로 돌아감).
function RedirectToLogin() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    returnPath.remember(`${pathname}${search}${hash}`);
  }, [pathname, search, hash]);

  return <Navigate to={paths.login} replace />;
}

// 로그인 여부만 본다. 확인 중에는 스플래시만 보이고 이동하지 않는다.
// 시작 시 확인이 연결 끊김·서버 오류로 실패하면 로그인으로 보내지 않고 다시 시도 화면을 띄운다.
export function AuthGate() {
  const session = useSession();

  if (session.startError) return <SessionStartErrorView session={session} />;
  if (session.status === 'loading') return <SessionSplash />;
  if (session.status === 'anonymous') return <RedirectToLogin />;
  return <Outlet />;
}
