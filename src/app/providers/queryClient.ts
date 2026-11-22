import { QueryClient } from '@tanstack/react-query';

import { isAppError } from '@shared/api';

const MAX_QUERY_RETRIES = 2;

// 조회 재시도: 다시 해 보면 나아질 수 있는 실패(연결 끊김·서버 오류)만 2회까지.
// 인증·권한·검증·충돌은 다시 보내도 결과가 같으므로 재시도하지 않는다(401 재발급 1회는 통신 계층이 따로 한다).
// 앱 오류가 아닌 예외는 코드 오류일 가능성이 커서 재시도하지 않는다.
// failureCount는 지금까지 실패한 횟수(첫 실패 때 0)다.
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  return isAppError(error) && (error.kind === 'network' || error.kind === 'server');
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        // 브라우저 창 포커스 때 다시 불러오지 않는다. 앱 복귀 때의 재조회는 PlatformBridge가 맡는다.
        refetchOnWindowFocus: false,
      },
      // 변경 요청(제출·삭제 등)은 두 번 반영될 수 있어 재시도하지 않는다.
      mutations: { retry: false },
    },
  });
}
