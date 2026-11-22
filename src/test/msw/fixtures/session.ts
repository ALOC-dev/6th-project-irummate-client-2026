// 서버 인증 상태 응답(GET /api/auth/status)의 user 모양. 시나리오별로 아래 값을 덮어쓴다.
export const mswUserId = 'msw-user-1';

export const serverUserBase = {
  id: mswUserId,
  nickname: '테스트',
  role: 'USER',
  status: 'ACTIVE',
  certificationStatus: 'NONE',
  detailsCompleted: false,
  surveyCompleted: false,
};

export const mswAccessToken = 'msw-access-token';
