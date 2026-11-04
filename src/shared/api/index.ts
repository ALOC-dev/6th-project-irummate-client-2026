// 계약 파일: 바꿀 때 상대의 리뷰가 필요하다. 기존 이름은 바꾸지 않고 선택 필드만 추가한다.
// 재발급 전용 클라이언트는 공개하지 않는다. presignedUpload·generated 타입은 나중에 더한다.
export { apiClient, publicClient, refreshAccessToken, registerAuthHandlers } from './client';
export type { AuthHandlers } from './client';
export { AppError, isAppError, toAppError } from './errors';
export type { AppErrorKind } from './errors';
export { unwrap, unwrapList } from './unwrap';
export type { ApiEnvelope } from './unwrap';
