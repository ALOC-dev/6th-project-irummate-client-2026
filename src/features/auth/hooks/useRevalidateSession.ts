import { useCallback } from 'react';

import { useSession } from './useSession';
import { useAuthActions } from './useAuthActions';

// 공개 계약(app용): 앱 복귀 때 세션을 조용히 다시 확인하는 함수를 돌려준다.
// 로그인된 상태가 아니면(시작 확인 중·비로그인·카카오 로그인에서 돌아오는 중) 확인하지 않고 false를 돌려준다.
// 세션이 유효하면 true. 호출하는 쪽은 true일 때만 화면 데이터를 다시 받아온다.
export function useRevalidateSession(): () => Promise<boolean> {
  const { status } = useSession();
  const { revalidate } = useAuthActions();
  return useCallback(() => (status === 'authenticated' ? revalidate() : Promise.resolve(false)), [status, revalidate]);
}
