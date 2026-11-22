import type { Session } from '@features/auth';
import { Button, EmptyState } from '@shared/ui';

const MESSAGES = {
  network: { title: '연결할 수 없어요', description: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.' },
  server: { title: '잠시 문제가 생겼어요', description: '잠시 후 다시 시도해 주세요.' },
} as const;

// 시작 시 세션 확인이 연결 끊김·서버 오류로 실패했을 때. 로그아웃하지 않고 다시 시도를 받는다.
// 확인 중 화면(스플래시)의 디자인은 나중에 이 자리에 함께 넣는다.
export function SessionStartErrorView({ session }: { session: Session }) {
  if (!session.startError) return null;
  const message = MESSAGES[session.startError];
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 pt-[var(--safe-area-top)]">
      <EmptyState
        title={message.title}
        description={message.description}
        action={session.retry ? <Button onClick={session.retry}>다시 시도</Button> : undefined}
      />
    </main>
  );
}
