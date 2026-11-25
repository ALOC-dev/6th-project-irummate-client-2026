// 계약 파일: 바꿀 때 상대의 리뷰가 필요하다. 기존 이름은 바꾸지 않고 선택 필드만 추가한다.

// B용: 세션·토큰
export type { OnboardingStage, Session, SessionStartError, SessionStatus, SessionUser } from './model/types';
export { useSession } from './hooks/useSession';
export { getAccessToken } from './model/clientBindings';

// app용: Provider, 통신 계층 등록
export { AuthProvider } from './model/AuthContext';
export { authClientBindings } from './model/clientBindings';
export { useRevalidateSession } from './hooks/useRevalidateSession';

// A 페이지용: 소개 완료 표시(소개 화면이 남기고, 개발용 MSW 시나리오도 쓴다)
export { introProgress } from './model/onboardingProgress';

// A 페이지용: 로그인·콜백·로그아웃·탈퇴
export { useKakaoLogin } from './hooks/useKakaoLogin';
export type { KakaoLogin, UseKakaoLoginOptions } from './hooks/useKakaoLogin';
export { useKakaoCallback } from './hooks/useKakaoCallback';
export type { KakaoCallbackFailure, KakaoCallbackResult } from './hooks/useKakaoCallback';
export { useLogout } from './hooks/useLogout';
export type { Logout } from './hooks/useLogout';
export { useWithdraw } from './hooks/useWithdraw';
export type { Withdraw } from './hooks/useWithdraw';
export { KakaoLoginButton } from './components/KakaoLoginButton';
export type { KakaoLoginButtonProps } from './components/KakaoLoginButton';
