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
];

const allowed: Array<[string, string, string]> = [
  ['page가 feature 공개 API import', 'src/pages/X.tsx', "import '@features/auth';"],
  ['shared/platform에서 Capacitor', 'src/shared/platform/x.ts', "import '@capacitor/core';"],
  ['shared/api에서 axios', 'src/shared/api/x.ts', "import 'axios';"],
  ['테스트 파일에서 @test', 'src/pages/X.test.tsx', "import '@test/setup';"],
  ['feature 안 상대 경로', 'src/features/auth/model/x.ts', "import '../index';"],
  ['env.ts에서 import.meta.env', 'src/shared/config/env.ts',
    'export const v = import.meta.env.VITE_API_BASE_URL;'],
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
