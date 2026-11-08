import { setupServer } from 'msw/node';

import { handlers } from './handlers';

// 테스트용 가짜 서버. setup.ts가 테스트마다 핸들러를 초기화한다.
export const server = setupServer(...handlers);
