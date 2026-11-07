import { Navigate } from 'react-router';

import { useSession } from '@features/auth';
import type { BuildTarget } from '@shared/config/env';

import { paths } from './paths';
import { entryPathFor } from './stageEntry';

// '/'로 들어오면 세션의 가입 단계에 맞는 첫 화면으로 보낸다.
// 빌드 대상은 routes.tsx가 넘긴다. 등록된 라우트 목록과 이동 목적지가 어긋나지 않게 하기 위해서다.
export function EntryRedirect({ target }: { target: BuildTarget }) {
  const { status, user } = useSession();

  if (status === 'loading') return null;
  if (!user) return <Navigate to={paths.login} replace />;
  return <Navigate to={entryPathFor(user.stage, target)} replace />;
}
