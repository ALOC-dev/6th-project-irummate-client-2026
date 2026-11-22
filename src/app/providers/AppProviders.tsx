import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { AuthProvider } from '@features/auth';

import { AppErrorBoundary } from './AppErrorBoundary';

// 순서 고정: 최후 방어선 오류 화면 → QueryClient → Auth → (라우터). Toast Provider가 필요해지면 Auth 안쪽에 둔다.
export function AppProviders({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
