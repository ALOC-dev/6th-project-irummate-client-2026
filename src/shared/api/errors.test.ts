import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { AppError, isAppError, toAppError } from './errors';

function axiosError(status: number | null, data: unknown = {}): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response = status === null
    ? undefined
    : ({ status, data, statusText: '', headers: {}, config } as AxiosResponse);
  return new AxiosError('fail', 'ERR', config, null, response);
}

describe('toAppError', () => {
  it.each([
    ['응답 없음', null, 'network'],
    ['401', 401, 'auth'],
    ['403', 403, 'forbidden'],
    ['409', 409, 'conflict'],
    ['400', 400, 'validation'],
    ['422', 422, 'validation'],
    ['500', 500, 'server'],
    ['503', 503, 'server'],
  ] as const)('%s → %s', (_name, status, kind) => {
    expect(toAppError(axiosError(status)).kind).toBe(kind);
  });

  it('서버 메시지·코드·필드 오류를 담는다', () => {
    const error = toAppError(axiosError(403, {
      code: 'SURVEY_REQUIRED',
      message: '설문을 먼저 완료해 주세요.',
      errors: [{ field: 'name', reason: '필수입니다.' }, { bad: true }],
    }));
    expect(error).toMatchObject({
      kind: 'forbidden',
      status: 403,
      code: 'SURVEY_REQUIRED',
      message: '설문을 먼저 완료해 주세요.',
      fieldErrors: { name: '필수입니다.' },
    });
  });

  it('서버 메시지가 없으면 종류별 기본 문구를 쓴다', () => {
    expect(toAppError(axiosError(null)).message).toBe('네트워크 연결을 확인해 주세요.');
  });

  it('이미 AppError면 그대로, 알 수 없는 값은 server', () => {
    const original = new AppError({ kind: 'conflict' });
    expect(toAppError(original)).toBe(original);
    expect(toAppError('oops').kind).toBe('server');
    expect(isAppError(toAppError(new Error('x')))).toBe(true);
  });
});
