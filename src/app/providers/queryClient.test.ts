import { describe, expect, it } from 'vitest';

import { AppError, type AppErrorKind } from '@shared/api';

import { createQueryClient, shouldRetryQuery } from './queryClient';

const appError = (kind: AppErrorKind) => new AppError({ kind });

describe('shouldRetryQuery', () => {
  it.each<[string, number, unknown, boolean]>([
    ['네트워크 첫 실패 → 재시도', 0, appError('network'), true],
    ['네트워크 두 번째 실패 → 재시도', 1, appError('network'), true],
    ['네트워크 세 번째 실패 → 그만', 2, appError('network'), false],
    ['서버 오류 → 재시도', 0, appError('server'), true],
    ['인증 → 재시도 안 함', 0, appError('auth'), false],
    ['권한 → 재시도 안 함', 0, appError('forbidden'), false],
    ['검증 → 재시도 안 함', 0, appError('validation'), false],
    ['충돌 → 재시도 안 함', 0, appError('conflict'), false],
    ['앱 오류가 아닌 예외 → 재시도 안 함', 0, new TypeError('bug'), false],
  ])('%s', (_name, failureCount, error, expected) => {
    expect(shouldRetryQuery(failureCount, error)).toBe(expected);
  });
});

describe('createQueryClient', () => {
  it('창 포커스 재조회를 끄고 변경 요청은 재시도하지 않는다', () => {
    const defaults = createQueryClient().getDefaultOptions();
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.queries?.retry).toBe(shouldRetryQuery);
    expect(defaults.mutations?.retry).toBe(false);
  });
});
