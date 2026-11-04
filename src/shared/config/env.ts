// 환경 변수는 이 파일에서만 읽는다. 다른 파일은 import.meta.env를 직접 쓰지 않는다.
// 최소 형태: 빌드 대상·API 주소·MSW 사용 여부. 필수 값 검사는 나중에 더한다.

export type BuildTarget = 'app' | 'admin-web';

function readBuildTarget(value: string | undefined): BuildTarget {
  return value === 'admin-web' ? 'admin-web' : 'app';
}

export const env = {
  buildTarget: readBuildTarget(import.meta.env.VITE_BUILD_TARGET),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  enableMocks: import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true',
} as const;
