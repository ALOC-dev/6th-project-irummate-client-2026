import { useEffect } from 'react';
import { Navigate } from 'react-router';

import { useSession } from '@features/auth';
import type { BuildTarget } from '@shared/config/env';

import { paths } from './paths';
import { returnPath } from './returnPath';
import { SessionSplash } from './SessionSplash';
import { SessionStartErrorView } from './SessionStartErrorView';
import { canReturnTo, entryPathFor } from './stageEntry';

// '/'로 들어오면 세션의 가입 단계에 맞는 첫 화면으로 보낸다. 로그인 전에 가려던 경로가 있으면 그리로 돌려보낸다.
// 빌드 대상은 routes.tsx가 넘긴다. 등록된 라우트 목록과 이동 목적지가 어긋나지 않게 하기 위해서다.
// 모든 이동은 히스토리를 대체해 뒤로가기가 '/'와 목적지 사이를 오가지 않게 한다.
export function EntryRedirect({ target }: { target: BuildTarget }) {
  const session = useSession();
  const { status, user, startError } = session;
  const decided = status !== 'loading' && !startError;

  // 기억한 경로는 한 번만 쓴다. 렌더 중에는 읽기만 하고(StrictMode의 이중 렌더), 이동을 정한 뒤에 지운다.
  useEffect(() => {
    if (decided) returnPath.clear();
  }, [decided]);

  if (startError) return <SessionStartErrorView session={session} />;
  if (status === 'loading') return <SessionSplash />;
  if (!user) return <Navigate to={paths.login} replace />;

  const saved = target === 'app' || user.stage === 'admin' ? returnPath.peek() : null;
  if (saved && canReturnTo(user.stage, saved)) return <Navigate to={saved} replace />;
  return <Navigate to={entryPathFor(user.stage, target)} replace />;
}
