import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';
import { readScenarioFromUrl } from './scenarios/session';

// 브라우저용 가짜 서버. VITE_ENABLE_MSW=true인 개발 빌드에서만 main.tsx가 동적 import로 부른다.
export async function startMockWorker(): Promise<void> {
  readScenarioFromUrl();
  await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' });
}
