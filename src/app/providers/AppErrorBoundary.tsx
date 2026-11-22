import { Component, type ReactNode } from 'react';

import { Button, EmptyState } from '@shared/ui';

interface State {
  failed: boolean;
}

// 최후 방어선. 라우터 바깥(Provider 등)에서 생긴 예외를 잡는다. 라우트 안의 예외는 RouteErrorBoundary가 먼저 잡는다.
// 라우터 밖이라 화면 이동은 못 하고 새로 불러오기만 둔다. 오류 내용은 화면에 보이지 않는다.
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-dvh items-center justify-center px-5 pt-[var(--safe-area-top)]">
        <EmptyState
          title="문제가 생겼어요"
          description="앱을 다시 불러와 주세요."
          action={<Button onClick={() => window.location.reload()}>다시 불러오기</Button>}
        />
      </main>
    );
  }
}
