import { Link } from 'react-router-dom';

import { PageContainer } from '../shared/ui';

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="grid min-h-screen place-items-center text-center">
        <div>
          <p className="text-sm font-semibold text-indigo-600">404</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">페이지를 찾을 수 없습니다.</h1>
          <Link className="mt-6 inline-block text-indigo-600 underline" to="/">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

