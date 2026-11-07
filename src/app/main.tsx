import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 0단계 PR 1의 임시 진입점. 계약 파일·라우트 골격 PR에서 Provider와 RouterProvider로 바꾼다.
const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <main>이룸매이트 0단계 뼈대</main>
    </StrictMode>,
  );
}
