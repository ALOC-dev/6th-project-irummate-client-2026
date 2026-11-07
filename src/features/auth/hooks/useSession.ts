import { useContext } from 'react';

import { AuthContext } from '../model/AuthContext';
import type { Session } from '../model/types';

// 공개 계약: 세션 읽기. Provider 밖에서 쓰면 바로 알 수 있게 오류를 낸다.
export function useSession(): Session {
  const session = useContext(AuthContext);
  if (!session) throw new Error('useSession은 AuthProvider 안에서만 쓸 수 있습니다.');
  return session;
}
