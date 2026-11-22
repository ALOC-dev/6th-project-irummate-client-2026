// Vitest 준비 파일: MSW 서버 시작 → 테스트마다 화면·핸들러·시나리오 초기화 → 종료
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { authClientBindings } from '@features/auth';

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

// Node 25부터 Node 자체의 localStorage가 전역에 생겨 jsdom의 것을 가린다. 저장 경로 설정 없이는 setItem도 없다.
// CI(Node 22)에서는 해당 없음. 쓸 수 없을 때만 메모리 저장소로 바꿔 끼운다.
if (typeof window !== 'undefined' && typeof window.localStorage?.setItem !== 'function') {
  class MemoryStorage implements Storage {
    private readonly items = new Map<string, string>();
    [name: string]: unknown;
    get length(): number {
      return this.items.size;
    }
    clear(): void {
      this.items.clear();
    }
    getItem(key: string): string | null {
      return this.items.get(key) ?? null;
    }
    key(index: number): string | null {
      return [...this.items.keys()][index] ?? null;
    }
    removeItem(key: string): void {
      this.items.delete(key);
    }
    setItem(key: string, value: string): void {
      this.items.set(key, String(value));
    }
  }
  Object.defineProperty(window, 'localStorage', { configurable: true, value: new MemoryStorage() });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetSessionScenario();
  // 접근 토큰은 모듈 메모리에 있어 테스트 사이에 남는다. 앱을 새로 연 것처럼 비운다.
  authClientBindings.clearAccessToken();
  // 로그인 state·가려던 경로 같은 탭 단위 값도 테스트마다 비운다.
  if (typeof window !== 'undefined') window.sessionStorage.clear();
});
afterAll(() => server.close());
