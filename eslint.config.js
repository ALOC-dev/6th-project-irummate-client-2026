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
  group: ['@features/*/**', '**/features/*/**'],
  message: 'feature는 index.ts(공개 API)로만 가져옵니다. 같은 feature 안에서는 상대 경로를 씁니다.',
};
const noCapacitor = { group: ['@capacitor/*'], message: '기기 기능은 @shared/platform 어댑터로 사용합니다.' };
const noAxios = { group: ['axios'], message: '서버 통신은 @shared/api의 client를 사용합니다.' };
const noTest = { group: ['@test/*', '**/test/**'], message: 'src/test의 도우미와 MSW는 테스트 파일에서만 import합니다.' };

const restrictImports = (...patterns) => ['error', { patterns }];

// ── 금지 문법: 경로 문자열, 임의 색상값, import.meta.env, 동적 import 우회 ──
const PATH_MESSAGE = '화면 이동은 @app/router/paths의 경로로만 합니다.';
const PATH_VALUES = ['Literal[value=/^\\//]', 'TemplateLiteral[quasis.0.value.raw=/^\\//]'];
const PATH_PLACES = [
  'JSXAttribute[name.name=/^(to|href)$/] >',
  'JSXAttribute[name.name=/^(to|href)$/] > JSXExpressionContainer >',
  'CallExpression[callee.name=/^(navigate|redirect)$/] >',
  "CallExpression[callee.property.name='navigate'] >",
  "CallExpression[callee.object.name='location'] >",
  "CallExpression[callee.object.property.name='location'] >",
  'AssignmentExpression[left.property.name=/^(href|pathname)$/] >',
  "Property[key.name='pathname'] >",
];
const noPathLiteral = PATH_PLACES.flatMap((place) =>
  PATH_VALUES.map((value) => ({ selector: `${place} ${value}`, message: PATH_MESSAGE })),
);

const COLOR_MESSAGE = '색은 디자인 토큰으로만 씁니다.';
const COLOR_FUNCTION = '\\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\\(';
// 문자열 전체, Tailwind [#...], CSS 값 위치의 #값만 색으로 본다. '게시글 #1234'는 색이 아니다.
const COLOR_HEX = '(^|\\[|:\\s*|(px|rem|em|solid|dashed|dotted)\\s+)#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\\b';
const COLOR_UTILITY = '(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|shadow|accent|caret|decoration|placeholder)';
const COLOR_PALETTE = '(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
const COLOR_TAILWIND = `(^|[\\s:!])${COLOR_UTILITY}-(${COLOR_PALETTE}-(50|[1-9]00|950)|white|black)\\b`;
const COLOR = `/${COLOR_FUNCTION}|${COLOR_HEX}|${COLOR_TAILWIND}/i`;
const STYLE_COLOR_KEY = '/^(color|background|backgroundColor|borderColor|fill|stroke|outlineColor)$/i';
const STYLE_COLOR_VALUE = '/^(?!(transparent|inherit|currentcolor|none|unset|initial)$)(?!var\\()/i';
const noColorLiteral = [
  // href·to의 해시 앵커(#add)는 색이 아니다.
  { selector: `Literal[value=${COLOR}]:not(JSXAttribute[name.name=/^(href|to)$/] > Literal)`, message: COLOR_MESSAGE },
  { selector: `TemplateElement[value.raw=${COLOR}]`, message: COLOR_MESSAGE },
  {
    selector: `JSXAttribute[name.name='style'] Property[key.name=${STYLE_COLOR_KEY}] > Literal[value=${STYLE_COLOR_VALUE}]`,
    message: COLOR_MESSAGE,
  },
];
const noEnvAccess = [
  {
    selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
    message: '환경 변수는 @shared/config/env에서만 읽습니다.',
  },
];

// no-restricted-imports는 정적 import만 보므로 동적 import()는 문법 규칙으로 막는다.
const dynamicImport = (pattern, message) => [
  { selector: `ImportExpression[source.value=${pattern}]`, message },
];
const noDynamicFeature = dynamicImport('/(^@|\\/)features\\/[^\\/]+\\/./', featureEntryOnly.message);
const noDynamicCapacitor = dynamicImport('/^@capacitor\\//', noCapacitor.message);
const noDynamicAxios = dynamicImport('/^axios$/', noAxios.message);
const noDynamicTest = dynamicImport('/^@test\\/|\\/test\\//', noTest.message);
// main.tsx의 개발 모드 MSW 시작만 허용한다. 이 동적 import는 운영 빌드에 들어가지 않는다.
const noDynamicTestExceptMswBrowser = dynamicImport(
  '/^@test\\/(?!msw\\/browser$)|\\/test\\//',
  noTest.message,
);

const restrictSyntax = (...groups) => ['error', ...groups.flat()];

// 허용할 항목만 고르면 정적·동적 import와 문법 규칙이 함께 맞춰진다.
const restrictedRules = ({ capacitor = false, axios = false, test = false, env = false, mswBrowser = false } = {}) => ({
  'no-restricted-imports': restrictImports(
    featureEntryOnly,
    ...(capacitor ? [] : [noCapacitor]),
    ...(axios ? [] : [noAxios]),
    ...(test ? [] : [noTest]),
  ),
  'no-restricted-syntax': restrictSyntax(
    noPathLiteral,
    noColorLiteral,
    env ? [] : noEnvAccess,
    noDynamicFeature,
    capacitor ? [] : noDynamicCapacitor,
    axios ? [] : noDynamicAxios,
    test ? [] : mswBrowser ? noDynamicTestExceptMswBrowser : noDynamicTest,
  ),
});

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
    rules: {
      // 웹 대체 구현처럼 시그니처만 맞추는 인자는 _로 시작한다.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
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
          // 화면 이동은 paths.ts로만 하므로 pages·features가 쓰는 app 파일은 이 하나뿐이다.
          { target: './src/features', from: './src/app', except: ['./router/paths.ts'],
            message: 'feature는 app을 import하지 않습니다. 화면 경로는 @app/router/paths만 씁니다.' },
          { target: './src/features', from: './src/pages',
            message: 'feature는 page를 import하지 않습니다.' },
          { target: './src/pages', from: './src/app', except: ['./router/paths.ts'],
            message: 'page는 app을 import하지 않습니다. 화면 경로는 @app/router/paths만 씁니다.' },
          ...FEATURES.map((name) => ({
            target: `./src/features/${name}`,
            from: './src/features',
            except: [`./${name}`],
            message: 'feature끼리는 import하지 않습니다. 조합은 page에서 합니다.',
          })),
        ],
      }],
      ...restrictedRules(),
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
    rules: restrictedRules({ capacitor: true }),
  },
  {
    files: ['src/shared/api/**/*.ts'],        // axios는 여기서만 허용
    rules: restrictedRules({ axios: true }),
  },
  {
    files: ['src/shared/config/env.ts'],      // import.meta.env는 여기서만 허용
    rules: restrictedRules({ env: true }),
  },
  {
    files: TEST_FILES,                        // 테스트에서만 @test 허용
    rules: restrictedRules({ test: true }),
  },
  {
    files: ['src/shared/platform/**/*.test.ts'],
    rules: restrictedRules({ capacitor: true, test: true }),
  },
  {
    files: ['src/shared/api/**/*.test.ts'],
    rules: restrictedRules({ axios: true, test: true }),
  },
  {
    files: ['src/app/main.tsx'],              // 개발 모드 MSW 시작(동적 import)만 예외
    rules: restrictedRules({ mswBrowser: true }),
  },
);
