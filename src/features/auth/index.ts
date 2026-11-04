// 계약 파일: 바꿀 때 상대의 리뷰가 필요하다. 기존 이름은 바꾸지 않고 선택 필드만 추가한다.

// B용: 세션·토큰
export type { OnboardingStage, Session, SessionStatus, SessionUser } from './model/types';
export { useSession } from './hooks/useSession';
export { getAccessToken } from './model/clientBindings';

// app용: Provider, 통신 계층 등록
export { AuthProvider } from './model/AuthContext';
export { authClientBindings } from './model/clientBindings';
