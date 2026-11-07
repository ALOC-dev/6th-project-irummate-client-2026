// 계약 파일: 바꿀 때 상대의 리뷰가 필요하다. 기존 이름은 바꾸지 않고 선택 필드만 추가한다.
// 어댑터는 모두 기능 이름으로 묶인 객체이고, 구독형은 해제 함수를 돌려준다.
// 지금은 웹 대체 동작만 있다. 앱 동작은 나중에 채운다.
export { runtime } from './isNative';
export type { PlatformName } from './isNative';
export { secureStorage } from './secureStorage';
export { backButton } from './backButton';
export { appLifecycle } from './appLifecycle';
export { keyboard } from './keyboard';
export type { KeyboardState } from './keyboard';
export { statusBar } from './statusBar';
export type { StatusBarOptions } from './statusBar';
export { externalBrowser } from './externalBrowser';
export { photoPicker } from './photoPicker';
export { push } from './push';
export type { PushPayload } from './push';
export { deepLink } from './deepLink';
export type { Unsubscribe } from './types';
