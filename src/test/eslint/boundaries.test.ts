// @vitest-environment node
// eslint.config.js의 계층 규칙이 위반을 잡고 허용 사례는 통과시키는지 확인한다.
// 가상 파일 경로에 코드를 놓고 ESLint로 검사하므로 실제 파일은 만들지 않는다.
// 위반 예시 문자열(색상값·경로)이 이 파일 자체에서 걸리지 않도록 금지 문법 규칙만 끈다.
/* eslint-disable no-restricted-syntax */
import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

let eslint: ESLint;

beforeAll(() => {
  eslint = new ESLint({ cwd: process.cwd() });
});

async function lint(filePath: string, code: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((m) => m.severity === 2);
}

const violations: Array<[string, string, string, string]> = [
  // [설명, 파일, 코드, 기대 규칙]
  ['feature끼리 import', 'src/features/auth/model/x.ts',
    "import '@features/roommate';", 'import/no-restricted-paths'],
  ['feature 내부 파일 직접 import', 'src/pages/match/X.tsx',
    "import '@features/auth/model/AuthContext';", 'no-restricted-imports'],
  ['shared/platform 밖 Capacitor', 'src/features/auth/model/x.ts',
    "import '@capacitor/core';", 'no-restricted-imports'],
  ['shared가 feature import', 'src/shared/api/x.ts',
    "import '@features/auth';", 'import/no-restricted-paths'],
  ['shared/api 밖 axios', 'src/features/auth/api/x.ts',
    "import 'axios';", 'no-restricted-imports'],
  ['page가 app import', 'src/pages/X.tsx',
    "import '@app/main';", 'import/no-restricted-paths'],
  ['feature가 app import', 'src/features/auth/model/x.ts',
    "import '@app/main';", 'import/no-restricted-paths'],
  ['테스트 밖 @test', 'src/pages/X.tsx',
    "import '@test/setup';", 'no-restricted-imports'],
  ['console 출력', 'src/pages/X.tsx',
    "console.log('x');", 'no-console'],
  ['경로 문자열 (to)', 'src/pages/X.tsx',
    'export const a = <a to="/home" />;', 'no-restricted-syntax'],
  ['경로 문자열 (navigate)', 'src/pages/X.tsx',
    "declare const navigate: (p: string) => void; navigate('/home');", 'no-restricted-syntax'],
  ['임의 색상값', 'src/pages/X.tsx',
    "export const c = 'bg-[#ff0000]';", 'no-restricted-syntax'],
  ['임의 색상값 (rgb)', 'src/pages/X.tsx',
    "export const c = 'rgb(0, 0, 0)';", 'no-restricted-syntax'],
  ['env.ts 밖 import.meta.env', 'src/features/auth/model/x.ts',
    'export const v = import.meta.env.VITE_API_BASE_URL;', 'no-restricted-syntax'],
  // 상대 경로 우회
  ['page가 상대 경로로 feature 내부 import', 'src/pages/X.tsx',
    "import '../features/auth/model/tokenStorage';", 'no-restricted-imports'],
  ['app이 상대 경로로 feature 내부 import', 'src/app/Y.tsx',
    "import '../features/auth/model/tokenStorage';", 'no-restricted-imports'],
  ['상대 경로로 src/test import', 'src/pages/X.tsx',
    "import '../test/setup';", 'no-restricted-imports'],
  // 동적 import 우회
  ['동적 import로 axios', 'src/features/auth/x.ts',
    "export const a = import('axios');", 'no-restricted-syntax'],
  ['동적 import로 Capacitor', 'src/pages/X.tsx',
    "export const a = import('@capacitor/core');", 'no-restricted-syntax'],
  ['동적 import로 feature 내부', 'src/pages/X.tsx',
    "export const a = import('@features/auth/model/tokenStorage');", 'no-restricted-syntax'],
  ['동적 import로 @test', 'src/app/Y.tsx',
    "export const a = import('@test/setup');", 'no-restricted-syntax'],
  ['main.tsx의 정적 @test', 'src/app/main.tsx',
    "import '@test/setup';", 'no-restricted-imports'],
  ['main.tsx의 다른 @test 동적 import', 'src/app/main.tsx',
    "export const a = import('@test/setup');", 'no-restricted-syntax'],
  // 경로 문자열의 다른 형태
  ['경로 템플릿 (navigate)', 'src/pages/X.tsx',
    'declare const navigate: (p: string) => void; declare const id: string; navigate(`/chat/${id}`);', 'no-restricted-syntax'],
  ['경로 템플릿 (to)', 'src/pages/X.tsx',
    'declare const id: string; export const a = <a to={`/chat/${id}`} />;', 'no-restricted-syntax'],
  ['경로 객체 (pathname)', 'src/pages/X.tsx',
    "declare const navigate: (p: object) => void; navigate({ pathname: '/home' });", 'no-restricted-syntax'],
  ['router.navigate', 'src/pages/X.tsx',
    "declare const router: { navigate: (p: string) => void }; router.navigate('/home');", 'no-restricted-syntax'],
  ['location.href 대입', 'src/pages/X.tsx',
    "window.location.href = '/home';", 'no-restricted-syntax'],
  ['href 속성', 'src/pages/X.tsx',
    'export const a = <a href="/home" />;', 'no-restricted-syntax'],
  // 색상값의 다른 형태
  ['임의 색상값 (oklch)', 'src/pages/X.tsx',
    "export const c = 'oklch(0.7 0.1 200)';", 'no-restricted-syntax'],
  ['임의 색상값 (대문자 RGBA)', 'src/pages/X.tsx',
    "export const c = 'RGBA(0,0,0,1)';", 'no-restricted-syntax'],
  ['임의 색상값 (문자열 전체 hex)', 'src/pages/X.tsx',
    "export const c = '#fff';", 'no-restricted-syntax'],
  ['임의 색상값 (CSS 값 hex)', 'src/pages/X.tsx',
    "export const c = '1px solid #123456';", 'no-restricted-syntax'],
  ['임의 색상값 (style 색 이름)', 'src/pages/X.tsx',
    "export const a = <a style={{ color: 'red' }} />;", 'no-restricted-syntax'],
  ['Tailwind 기본 색상', 'src/pages/X.tsx',
    "export const c = 'p-2 hover:bg-slate-500';", 'no-restricted-syntax'],
];

const allowed: Array<[string, string, string]> = [
  ['page가 feature 공개 API import', 'src/pages/X.tsx', "import '@features/auth';"],
  ['shared/platform에서 Capacitor', 'src/shared/platform/x.ts', "import '@capacitor/core';"],
  ['shared/api에서 axios', 'src/shared/api/x.ts', "import 'axios';"],
  ['테스트 파일에서 @test', 'src/pages/X.test.tsx', "import '@test/setup';"],
  ['feature 안 상대 경로', 'src/features/auth/model/x.ts', "import '../index';"],
  ['env.ts에서 import.meta.env', 'src/shared/config/env.ts',
    'export const v = import.meta.env.VITE_API_BASE_URL;'],
  ['page가 paths.ts import', 'src/pages/X.tsx', "import '@app/router/paths';"],
  ['feature가 paths.ts import', 'src/features/auth/model/x.ts', "import '@app/router/paths';"],
  ['main.tsx의 MSW 시작', 'src/app/main.tsx', "export const a = import('@test/msw/browser');"],
  ['해시 앵커', 'src/pages/X.tsx', 'export const a = <a href="#add" />;'],
  ['# 뒤에 숫자가 오는 사용자 문구', 'src/pages/X.tsx', "export const a = '게시글 #1234';"],
  ['토큰 style 값', 'src/pages/X.tsx', "export const a = <a style={{ color: 'var(--color-text)' }} />;"],
  ['경로 상수로 이동', 'src/pages/X.tsx',
    'declare const navigate: (p: string) => void; declare const home: string; navigate(home);'],
];

describe('ESLint 계층 규칙', () => {
  it.each(violations)('위반: %s', async (_name, filePath, code, ruleId) => {
    const errors = await lint(filePath, code);
    expect(errors.map((m) => m.ruleId)).toContain(ruleId);
  });

  it.each(allowed)('허용: %s', async (_name, filePath, code) => {
    const errors = await lint(filePath, code);
    expect(errors).toEqual([]);
  });
}, 60_000);
