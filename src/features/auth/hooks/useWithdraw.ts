import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { withdraw as withdrawRequest } from '../api/authApi';
import { useAuthActions } from './useAuthActions';

export interface Withdraw {
  // 실패하면 앱 오류를 던진다. 이때는 로그인 상태를 유지한다(호출한 화면이 알림을 띄움).
  withdraw(): Promise<void>;
  isPending: boolean;
}

// 회원탈퇴: 서버 요청이 성공했을 때만 기기의 로그인 정보를 지우고 쿼리 캐시를 비운다.
// 소개 완료 표시는 사용자별이고, 다시 가입하면 새 id를 받으므로 지우지 않는다.
export function useWithdraw(): Withdraw {
  const { signOut } = useAuthActions();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const withdraw = useCallback(async () => {
    setIsPending(true);
    try {
      await withdrawRequest();
      signOut();
      queryClient.clear();
    } finally {
      setIsPending(false);
    }
  }, [signOut, queryClient]);

  return { withdraw, isPending };
}
