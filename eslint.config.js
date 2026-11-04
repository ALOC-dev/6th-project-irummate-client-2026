import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

// ── 의존 규칙: AGENTS.md "계층 규칙"을 린트로 강제한다 ──
// feature를 추가할 때 이 배열도 함께 고친다.
const FEATURES = ['auth', 'terms', 'profile', 'verification', 'dorm',
                  'roommate', 'mate-post', 'chat', 'notification', 'admin'];

const featureEntryOnly = {
  group: ['@features/*/**'],
  message: 'feature는 index.ts(공개 API)로만 가져옵니다. 같은 feature 안에서는 상대 경로를 씁니다.',
};
const noCapacitor = { group: ['@capacitor/*'], message: '기기 기능은 @shared/platform 어댑터로 사용합니다.' };
const noAxios = { group: ['axios'], message: '서버 통신은 @shared/api의 client를 사용합니다.' };
const noTest = { group: ['@test/*'], message: 'src/test의 도우미와 MSW는 테스트 파일에서만 import합니다.' };

const restrictImports = (...patterns) => ['error', { patterns }];

// ── 금지 문법: 경로 문자열, 임의 색상값, import.meta.env ──
const noPathLiteral = [
  {
    selector: "JSXAttribute[name.name='to'] > Literal[value=/^\\//]",
    message: '화면 이동은 @app/router/paths의 경로로만 합니다.',
  },
  {
    selector: "JSXAttribute[name.name='to'] > JSXExpressionContainer > Literal[value=/^\\//]",
    message: '화면 이동은 @app/router/paths의 경로로만 합니다.',
  },
  {
    selector: "CallExpression[callee.name='navigate'][arguments.0.type='Literal'][arguments.0.value=/^\\//]",
    message: '화면 이동은 @app/router/paths의 경로로만 합니다.',
  },
];
const COLOR = '/#[0-9a-fA-F]{3,8}\\b|\\b(rgb|rgba|hsl|hsla)\\(/';
const noColorLiteral = [
  { selector: `Literal[value=${COLOR}]`, message: '색은 디자인 토큰으로만 씁니다.' },
  { selector: `TemplateElement[value.raw=${COLOR}]`, message: '색은 디자인 토큰으로만 씁니다.' },
];
const noEnvAccess = [
  {
    selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
    message: '환경 변수는 @shared/config/env에서만 읽습니다.',
  },
];

const restrictSyntax = (...groups) => ['error', ...groups.flat()];

const TEST_FILES = ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'];

export default tseslint.config(
  {
    ignores: [
      'dist', 'dist-admin-web', 'coverage', 'playwright-report', 'test-results',
      'public', 'android', 'ios', 'draft', 'docs-private',
      'src/shared/api/generated',
      // 옛 JS 뼈대 중 uukdo 영역 파일(정리는 uukdo가 판단). allowJs를 끄므로 빌드에도 들어가지 않는다.
      'src/**/*.{js,jsx}',
    ],
  },
  {
    files: ['*.js', '*.mjs', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['*.config.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { import: importPlugin, 'react-hooks': reactHooks },
    settings: { 'import/resolver': { typescript: { project: './tsconfig.json' } } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'import/no-restricted-paths': ['error', {
        zones: [
          { target: './src/shared', from: ['./src/app', './src/pages', './src/features'],
            message: 'shared는 도메인과 화면을 몰라야 합니다.' },
          { target: './src/features', from: ['./src/app', './src/pages'],
            message: 'feature는 page와 app을 import하지 않습니다.' },
          { target: './src/pages', from: './src/app',
            message: 'page는 app을 import하지 않습니다.' },
          ...FEATURES.map((name) => ({
            target: `./src/features/${name}`,
            from: './src/features',
            except: [`./${name}`],
            message: 'feature끼리는 import하지 않습니다. 조합은 page에서 합니다.',
          })),
        ],
      }],
      'no-restricted-imports': restrictImports(featureEntryOnly, noCapacitor, noAxios, noTest),
      'no-restricted-syntax': restrictSyntax(noPathLiteral, noColorLiteral, noEnvAccess),
      'no-console': 'error',
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['src/pages/**/*.tsx'],
    rules: { 'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ['src/shared/platform/**/*.ts'],   // Capacitor는 여기서만 허용
    rules: { 'no-restricted-imports': restrictImports(featureEntryOnly, noAxios, noTest) },
  },
  {
    files: ['src/shared/api/**/*.ts'],        // axios는 여기서만 허용
    rules: { 'no-restricted-imports': restrictImports(featureEntryOnly, noCapacitor, noTest) },
  },
  {
    files: ['src/shared/config/env.ts'],      // import.meta.env는 여기서만 허용
    rules: { 'no-restricted-syntax': restrictSyntax(noPathLiteral, noColorLiteral) },
  },
  {
    files: TEST_FILES,                        // 테스트에서만 @test 허용
    rules: { 'no-restricted-imports': restrictImports(featureEntryOnly, noCapacitor, noAxios) },
  },
  {
    files: ['src/shared/platform/**/*.test.ts'],
    rules: { 'no-restricted-imports': restrictImports(featureEntryOnly, noAxios) },
  },
  {
    files: ['src/shared/api/**/*.test.ts'],
    rules: { 'no-restricted-imports': restrictImports(featureEntryOnly, noCapacitor) },
  },
  {
    files: ['src/app/main.tsx'],              // 개발 모드 MSW 시작(동적 import)만 예외
    rules: { 'no-restricted-imports': restrictImports(featureEntryOnly, noCapacitor, noAxios) },
  },
);
