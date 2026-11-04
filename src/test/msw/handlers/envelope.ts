import { HttpResponse } from 'msw';

// 서버 표준 응답 봉투: { status, code, message, data, errors }
export function ok<T>(data: T, status = 200) {
  return HttpResponse.json({ status, code: 'OK', message: 'OK', data, errors: null }, { status });
}

export function fail(status: number, code: string, message: string) {
  return HttpResponse.json({ status, code, message, data: null, errors: null }, { status });
}
