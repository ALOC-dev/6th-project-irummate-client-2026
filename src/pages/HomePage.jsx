import { Link } from 'react-router-dom';

import { AuthStatus } from '../features/auth';
import { MatePostPreview } from '../features/mate-post';
import { RoommateSummary } from '../features/roommate';
import { PageContainer } from '../shared/ui';

export function HomePage() {
  return (
    <PageContainer>
      <header className="flex items-center justify-between gap-4 py-6">
        <Link className="text-xl font-bold text-slate-900" to="/">
          이룸메이트
        </Link>
        <AuthStatus />
      </header>

      <main className="grid gap-6 py-12">
        <section>
          <p className="mb-3 text-sm font-semibold text-indigo-600">서비스 골격 준비 완료</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900">
            함께 살 사람을 찾는 가장 편한 방법
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            기능별로 분리된 구조에서 인증, 룸메이트, 메이트 모집글, 채팅, 프로필을 확장해 보세요.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <RoommateSummary />
          <MatePostPreview />
        </div>
      </main>
    </PageContainer>
  );
}

