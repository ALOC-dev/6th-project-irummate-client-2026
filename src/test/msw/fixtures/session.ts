import type { SessionUser } from '@features/auth';

// 임시 모양: 계약의 세션 사용자를 그대로 준다. 나중에 서버 인증 상태 응답 모양으로 바꾼다.
export const sessionUserBase: Omit<SessionUser, 'stage' | 'dormRoom'> = { id: 1, name: '테스트' };
export const certifiedDormRoom = '408호';
export const mswAccessToken = 'msw-access-token';
