// 가입 단계. 판정은 model/onboardingStage.ts가 한다.
// pending: 인증 심사 중. 앱 전체를 열고 매칭·채팅에서만 심사 중 안내를 띄운다(ADR 0004).
export type OnboardingStage =
  | 'login'
  | 'terms'
  | 'intro'
  | 'profile'
  | 'certification'
  | 'pending'
  | 'certified'
  | 'admin';

// 서버 인증 상태 응답(GET /api/auth/status)의 user를 화면용으로 옮긴 것. 이름은 서버와 같다.
export interface SessionUser {
  // 서버가 사용자 번호를 해시로 바꾼 문자열. 채팅·매칭 등 다른 API의 사용자 id와 같은 값이라 그대로 비교한다.
  id: string;
  // 앱 안에서 보이는 이름(가입 시 카카오 닉네임). 실명은 개인정보라 세션에 두지 않는다.
  nickname: string;
  // 서버 인증 상태 응답에 호실이 없어 지금은 항상 null. 호실은 dorm 쪽 API에서 읽는다.
  dormRoom: string | null;
  stage: OnboardingStage;
}

// loading은 시작 시 확인 중. 확인이 실패해 다시 시도를 기다리는 동안도 loading이다(startError로 구분).
export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

// 시작 시 확인이 로그인 여부와 상관없는 이유로 실패한 경우. network: 연결 끊김, server: 서버 오류.
export type SessionStartError = 'network' | 'server';

export interface Session {
  status: SessionStatus;
  user: SessionUser | null;
  // 시작 시 확인이 실패했을 때만 있다. 스플래시가 안내와 다시 시도 버튼을 띄운다.
  startError?: SessionStartError;
  // 시작 시 확인을 다시 한다. startError가 있을 때 쓴다.
  retry?: () => void;
}
