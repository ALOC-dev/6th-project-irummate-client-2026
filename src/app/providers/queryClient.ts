import { QueryClient } from '@tanstack/react-query';

// 재시도·staleTime 기본값은 나중에 앱 오류 종류에 맞춰 정한다.
export function createQueryClient(): QueryClient {
  return new QueryClient();
}
