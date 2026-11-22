import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { logout as logoutRequest } from '../api/authApi';
import { useAuthActions } from './useAuthActions';

export interface Logout {
  logout(): Promise<void>;
  isPending: boolean;
}

// 로그아웃: 서버 요청 → 기기의 로그인 정보 삭제 → 쿼리 캐시 비우기 → 비로그인.
// 서버 요청이 실패해도(네트워크 끊김 등) 기기에서는 로그아웃한다. 화면 이동은 가드가 한다(비로그인 → 로그인 화면).
export function useLogout(): Logout {
  const { signOut } = useAuthActions();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await logoutRequest();
    } catch {
      // 서버가 재발급 쿠키를 지우지 못했어도 메모리 토큰이 없으면 이 화면에서는 로그인 상태가 아니다.
    } finally {
      signOut();
      // 다음 사용자에게 이전 사용자의 데이터가 보이지 않게 한다.
      queryClient.clear();
      setIsPending(false);
    }
  }, [signOut, queryClient]);

  return { logout, isPending };
}
