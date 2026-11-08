// Vitest 준비 파일. MSW 서버 시작·초기화·종료는 MSW 환경 PR에서 더한다.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
