// 백엔드 OpenAPI 문서에서 src/shared/api/generated/schema.d.ts를 만든다.
// 주소는 OPENAPI_URL(환경 변수 또는 .env)에서 읽는다. 생성 파일은 직접 고치지 않는다.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!process.env.OPENAPI_URL && existsSync('.env')) {
  process.loadEnvFile('.env');
}

const source = process.env.OPENAPI_URL;
if (!source) {
  process.stderr.write('OPENAPI_URL이 비어 있습니다. .env 또는 환경 변수에 백엔드 OpenAPI 문서 주소를 넣어 주세요.\n');
  process.exit(1);
}

execFileSync(
  'npx',
  ['openapi-typescript', source, '-o', 'src/shared/api/generated/schema.d.ts'],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);
