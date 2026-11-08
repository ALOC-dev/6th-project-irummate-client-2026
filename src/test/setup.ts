// Vitest 준비 파일: MSW 서버 시작 → 테스트마다 화면·핸들러·시나리오 초기화 → 종료
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { resetSessionScenario } from './msw/scenarios/session';
import { server } from './msw/server';

// jsdom 호환: 데이터 라우터는 jsdom의 AbortSignal을 Node의 Request에 넘기는데, Node는 자기 AbortSignal만 받는다.
// 테스트 환경에서만 signal을 빼고 Request를 만든다(취소 동작은 테스트에서 쓰지 않음).
if (typeof window !== 'undefined') {
  const NodeRequest = globalThis.Request;
  globalThis.Request = class extends NodeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      const { signal: _signal, ...rest } = init ?? {};
      super(input, rest);
    }
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetSessionScenario();
});
afterAll(() => server.close());
