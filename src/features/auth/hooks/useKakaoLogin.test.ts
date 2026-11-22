import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { externalBrowser, runtime } from '@shared/platform';

import { kakaoOAuthState } from '../model/kakaoOAuthState';
import { buildKakaoAuthorizeUrl, useKakaoLogin } from './useKakaoLogin';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildKakaoAuthorizeUrl', () => {
  it('카카오 인증 주소에 코드 방식과 state를 붙인다', () => {
    const url = new URL(buildKakaoAuthorizeUrl('state-123'));
    expect(`${url.origin}${url.pathname}`).toBe('https://kauth.kakao.com/oauth/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('state-123');
    expect(url.searchParams.has('client_id')).toBe(true);
    expect(url.searchParams.has('redirect_uri')).toBe(true);
  });
});

describe('useKakaoLogin', () => {
  it('웹: state를 저장하고 현재 창을 카카오 인증 주소로 옮긴다', async () => {
    const redirect = vi.fn();
    const { result } = renderHook(() => useKakaoLogin({ redirect }));

    await act(() => result.current.login());

    expect(redirect).toHaveBeenCalledTimes(1);
    const url = new URL(redirect.mock.calls[0]?.[0] as string);
    expect(url.hostname).toBe('kauth.kakao.com');
    const state = url.searchParams.get('state');
    expect(kakaoOAuthState.consume(state)).toBe(true);
    // 웹은 페이지를 떠나므로 진행 중 표시를 유지한다.
    expect(result.current.isStarting).toBe(true);
  });

  it('앱: 외부 브라우저로 열고, 화면이 남으므로 진행 중 표시를 푼다', async () => {
    vi.spyOn(runtime, 'isNative').mockReturnValue(true);
    const open = vi.spyOn(externalBrowser, 'open').mockResolvedValue();
    const redirect = vi.fn();
    const { result } = renderHook(() => useKakaoLogin({ redirect }));

    await act(() => result.current.login());

    expect(redirect).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
    expect(new URL(open.mock.calls[0]?.[0] as string).hostname).toBe('kauth.kakao.com');
    expect(result.current.isStarting).toBe(false);
  });

  it('외부 브라우저를 열지 못하면 오류를 던지고 진행 중 표시를 푼다', async () => {
    vi.spyOn(runtime, 'isNative').mockReturnValue(true);
    vi.spyOn(externalBrowser, 'open').mockRejectedValue(new Error('cannot open'));
    const { result } = renderHook(() => useKakaoLogin({ redirect: vi.fn() }));

    await act(async () => {
      await expect(result.current.login()).rejects.toThrow('cannot open');
    });

    expect(result.current.isStarting).toBe(false);
  });
});
