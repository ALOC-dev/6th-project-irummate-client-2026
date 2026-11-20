import { describe, expect, it } from 'vitest';

import { EnvError, findMissingEnv, type EnvCheckOptions, type EnvValues } from './env';

const filled: EnvValues = {
  apiBaseUrl: 'https://api.example.com',
  kakaoClientId: 'kakao-client-id',
  kakaoRedirectUri: 'https://example.com/oauth/kakao/callback',
};

const web: EnvCheckOptions = { isNative: false, enableMocks: false };
const native: EnvCheckOptions = { isNative: true, enableMocks: false };
const webMocks: EnvCheckOptions = { isNative: false, enableMocks: true };
const nativeMocks: EnvCheckOptions = { isNative: true, enableMocks: true };

describe('findMissingEnv', () => {
  it.each<[string, Partial<EnvValues>, EnvCheckOptions, string[]]>([
    ['웹, 모두 있음', {}, web, []],
    ['앱, 모두 있음', {}, native, []],
    ['웹은 API 주소가 비어도 통과(프록시)', { apiBaseUrl: '' }, web, []],
    ['앱은 API 주소가 비면 실패', { apiBaseUrl: '' }, native, ['VITE_API_BASE_URL']],
    ['앱은 API 주소가 공백뿐이면 실패', { apiBaseUrl: '   ' }, native, ['VITE_API_BASE_URL']],
    ['앱은 API 주소가 http·https가 아니면 실패', { apiBaseUrl: 'api.example.com' }, native, ['VITE_API_BASE_URL']],
    ['앱은 http 주소 허용(로컬 서버)', { apiBaseUrl: 'http://10.0.2.2:8080' }, native, []],
    ['카카오 client id가 비면 실패', { kakaoClientId: '' }, web, ['VITE_KAKAO_CLIENT_ID']],
    ['카카오 redirect uri가 비면 실패', { kakaoRedirectUri: '' }, native, ['VITE_KAKAO_REDIRECT_URI']],
    ['MSW 모드는 카카오 키 생략 가능', { kakaoClientId: '', kakaoRedirectUri: '' }, webMocks, []],
    ['MSW 모드여도 앱은 API 주소 필수', { apiBaseUrl: '' }, nativeMocks, ['VITE_API_BASE_URL']],
    [
      '여러 키가 비면 모두 알림',
      { apiBaseUrl: '', kakaoClientId: '', kakaoRedirectUri: '' },
      native,
      ['VITE_API_BASE_URL', 'VITE_KAKAO_CLIENT_ID', 'VITE_KAKAO_REDIRECT_URI'],
    ],
  ])('%s', (_name, override, options, expected) => {
    expect(findMissingEnv({ ...filled, ...override }, options)).toEqual(expected);
  });
});

describe('EnvError', () => {
  it('키 이름만 담고 값은 담지 않는다', () => {
    const error = new EnvError(['VITE_API_BASE_URL', 'VITE_KAKAO_CLIENT_ID']);
    expect(error.missingKeys).toEqual(['VITE_API_BASE_URL', 'VITE_KAKAO_CLIENT_ID']);
    expect(error.message).toContain('VITE_API_BASE_URL, VITE_KAKAO_CLIENT_ID');
  });
});
