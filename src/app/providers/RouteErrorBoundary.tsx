import { useNavigate } from 'react-router';

import { Button, EmptyState } from '@shared/ui';

import { paths } from '../router/paths';

// 라우트 단위 오류 화면. 화면을 그리다 생긴 예외나 화면 파일을 받지 못한 경우를 잡는다.
// 앱에서 흰 화면으로 멈추면 강제 종료밖에 방법이 없어서 다시 시도·홈으로를 둔다.
// 오류 내용은 화면에 보이지 않는다(토큰·개인정보가 섞일 수 있음).
export function RouteErrorBoundary() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 pt-[var(--safe-area-top)]">
      <EmptyState
        title="화면을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <div className="flex gap-2">
            {/* 화면 파일을 받지 못한 경우도 고치려면 새로 불러와야 한다. 세션은 시작 시 재발급으로 다시 채운다. */}
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
            <Button variant="secondary" onClick={() => navigate(paths.entry, { replace: true })}>
              홈으로
            </Button>
          </div>
        }
      />
    </main>
  );
}
