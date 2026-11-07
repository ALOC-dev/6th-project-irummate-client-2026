// 계약 파일: 바꿀 때 상대의 리뷰가 필요하다. 기존 이름은 바꾸지 않고 필드만 추가한다.
// 화면 이동은 이 파일의 경로로만 한다.

export type PolicyKey = 'tos' | 'privacy' | 'marketing';

export const paths = {
  entry: '/',
  login: '/login',
  kakaoCallback: '/oauth/kakao/callback',
  onboarding: {
    terms: '/onboarding/terms',
    intro: '/onboarding/intro',
    profile: '/onboarding/profile',
    certification: '/onboarding/certification',
  },
  home: '/home',
  match: '/match',
  mateProfile: (mateId: string) => `/match/mates/${encodeURIComponent(mateId)}`,
  matchResult: (mateId: string) => `/match/mates/${encodeURIComponent(mateId)}/result`,
  mate: '/mate',
  matePost: (postId: string) => `/mate?post=${encodeURIComponent(postId)}`,
  mateCompose: '/mate?compose=1',
  chats: '/chats',
  chatRoom: (roomId: string) => `/chats/${encodeURIComponent(roomId)}`,
  my: '/my',
  survey: '/my/survey',
  policy: (policyKey: PolicyKey) => `/my/policies/${policyKey}`,
  blocked: '/my/blocked',
  notificationSettings: '/my/notifications',
  admin: {
    home: '/admin',
  },
} as const;

// 라우트 등록용 패턴. `:이름` 자리에 실제 값이 들어온다.
// routes.tsx만 쓴다. 화면 이동에는 위 paths의 함수를 쓴다(패턴으로 이동하면 주소에 ':mateId'가 그대로 들어간다).
// 위 함수와 어긋나지 않는지는 paths.test.ts가 확인한다.
export const routePatterns = {
  mateProfile: '/match/mates/:mateId',
  matchResult: '/match/mates/:mateId/result',
  chatRoom: '/chats/:roomId',
  policy: '/my/policies/:policyKey',
} as const;

// 하단 탭 4개의 루트. 뒤로가기 처리(앱 종료 확인)에 쓴다.
export const tabRoots = [paths.home, paths.match, paths.mate, paths.my] as const;
export type TabRoot = (typeof tabRoots)[number];
