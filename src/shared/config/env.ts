// 환경 변수는 이 파일에서만 읽는다. 다른 파일은 import.meta.env를 직접 쓰지 않는다.
// 필수 값 검사는 assertEnv로 앱 시작 시 한 번 한다(app/main.tsx). 빌드 때 검사하지 않는 이유:
// CI는 .env 없이 빌드하므로, 빌드에서 막으면 CI가 깨진다.

export type BuildTarget = 'app' | 'admin-web';

function readBuildTarget(value: string | undefined): BuildTarget {
  return value === 'admin-web' ? 'admin-web' : 'app';
}

// 앞뒤 공백을 지운 값만 쓴다. 검사한 값과 실제로 요청에 쓰는 값을 같게 하기 위해서다.
// .env의 따옴표 없는 값은 Vite가 이미 다듬지만, 따옴표 안의 값과 배포 환경(Vercel 등)에 붙여 넣은 값은 공백이 남을 수 있다.
function readText(value: string | undefined): string {
  return (value ?? '').trim();
}

export const env = {
  buildTarget: readBuildTarget(import.meta.env.VITE_BUILD_TARGET),
  apiBaseUrl: readText(import.meta.env.VITE_API_BASE_URL),
  kakaoClientId: readText(import.meta.env.VITE_KAKAO_CLIENT_ID),
  kakaoRedirectUri: readText(import.meta.env.VITE_KAKAO_REDIRECT_URI),
  enableMocks: import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true',
} as const;

export interface EnvValues {
  apiBaseUrl: string;
  kakaoClientId: string;
  kakaoRedirectUri: string;
}

export interface EnvCheckOptions {
  // 앱(Android·iOS)에서 도는지. env.ts는 Capacitor를 import할 수 없으므로 호출하는 쪽이 넘긴다.
  isNative: boolean;
  // MSW 가짜 서버 모드면 카카오 키 검사를 건너뛴다.
  enableMocks: boolean;
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// 비어 있거나 형식이 틀린 필수 키의 이름 목록. 값은 담지 않는다.
export function findMissingEnv(values: EnvValues, options: EnvCheckOptions): string[] {
  const missing: string[] = [];

  // 웹은 API 주소가 비면 같은 출처의 /api(개발 서버 프록시·Vercel 리라이트)를 쓴다. 앱은 같은 출처가 앱 내부라 필수다.
  if (options.isNative && !isHttpUrl(values.apiBaseUrl.trim())) missing.push('VITE_API_BASE_URL');

  if (!options.enableMocks) {
    // client id는 주소가 아닌 앱 키라 빈 값만 본다. redirect uri는 카카오가 돌려보낼 주소라 http·https 주소여야 한다.
    if (!values.kakaoClientId.trim()) missing.push('VITE_KAKAO_CLIENT_ID');
    if (!isHttpUrl(values.kakaoRedirectUri.trim())) missing.push('VITE_KAKAO_REDIRECT_URI');
  }

  return missing;
}

export class EnvError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`필수 환경 변수가 비어 있거나 형식이 틀립니다: ${missingKeys.join(', ')}`);
    this.name = 'EnvError';
    this.missingKeys = missingKeys;
  }
}

// 앱 시작 시 한 번 부른다. 빠진 키가 있으면 키 이름을 담아 바로 실패한다.
export function assertEnv(options: Pick<EnvCheckOptions, 'isNative'>): void {
  const missing = findMissingEnv(env, { isNative: options.isNative, enableMocks: env.enableMocks });
  if (missing.length > 0) throw new EnvError(missing);
}
