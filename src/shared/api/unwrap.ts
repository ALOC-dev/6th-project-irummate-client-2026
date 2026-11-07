// 서버 표준 응답 봉투: { status, code, message, data, errors }
export interface ApiEnvelope<T> {
  status?: number;
  code?: string;
  message?: string;
  data: T;
  errors?: unknown;
}

// 단건: 봉투에서 data만 꺼낸다.
export function unwrap<T>(body: ApiEnvelope<T>): T {
  return body.data;
}

// 목록: data가 배열이 아니면 빈 배열로 본다.
export function unwrapList<T>(body: ApiEnvelope<T[] | null | undefined>): T[] {
  return Array.isArray(body.data) ? body.data : [];
}
