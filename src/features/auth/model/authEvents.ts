// 1학기 src/auth/authEvents.js 이식. 브라우저 전역 이벤트 대신 구독·발송만 있는 작은 이벤트 객체.
// 테스트에서 전역 상태를 건드리지 않아도 된다.
export type AuthEventType = 'expired' | 'tokenRefreshed';

type Listener = () => void;

const listeners: Record<AuthEventType, Set<Listener>> = {
  expired: new Set(),
  tokenRefreshed: new Set(),
};

export const authEvents = {
  emit(type: AuthEventType): void {
    listeners[type].forEach((listener) => listener());
  },
  subscribe(type: AuthEventType, listener: Listener): () => void {
    listeners[type].add(listener);
    return () => {
      listeners[type].delete(listener);
    };
  },
};
