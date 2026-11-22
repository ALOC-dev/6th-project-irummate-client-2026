import { describe, expect, it } from 'vitest';

import { kakaoOAuthState } from './kakaoOAuthState';

describe('kakaoOAuthState', () => {
  it('만든 값은 매번 다르고 32자리 16진수다', () => {
    const first = kakaoOAuthState.issue();
    const second = kakaoOAuthState.issue();
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(second).not.toBe(first);
  });

  it('돌아온 값이 같으면 통과하고, 같은 값으로 다시 오면 거부한다', () => {
    const state = kakaoOAuthState.issue();
    expect(kakaoOAuthState.consume(state)).toBe(true);
    expect(kakaoOAuthState.consume(state)).toBe(false);
  });

  it.each<[string, string | null]>([
    ['다른 값', 'forged-state'],
    ['값 없음', null],
    ['빈 값', ''],
  ])('%s → 거부하고 저장한 값도 지운다', (_name, received) => {
    const state = kakaoOAuthState.issue();
    expect(kakaoOAuthState.consume(received)).toBe(false);
    expect(kakaoOAuthState.consume(state)).toBe(false);
  });

  it('로그인을 시작하지 않았으면 거부한다', () => {
    kakaoOAuthState.consume(null);
    expect(kakaoOAuthState.consume('anything')).toBe(false);
  });
});
