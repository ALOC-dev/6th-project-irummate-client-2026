# 6th-project-irummate-client-2026

이룸매이트 2학기 클라이언트. 기숙사 룸메이트 매칭과 밥·취미·공동구매 메이트 모집 앱입니다.
작업 규칙은 [AGENTS.md](AGENTS.md), 기여 순서는 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다.

## 시작하기

```bash
npm install
cp .env.example .env     # 값 채우기 (MSW로 개발하려면 VITE_ENABLE_MSW=true)
npm run dev
```

## 명령어

| 명령 | 내용 |
| --- | --- |
| `npm run dev` | 개발 서버 (앱 빌드 대상) |
| `npm run dev:admin-web` | 개발 서버 (관리자 웹 빌드 대상) |
| `npm run build` | 앱 빌드 → `dist/` (Capacitor `webDir`) |
| `npm run build:admin-web` | 관리자 웹 빌드 → `dist-admin-web/` (Vercel) |
| `npm run lint` | ESLint (계층 규칙 포함) |
| `npm run typecheck` | TypeScript 검사 |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run gen:api` | 백엔드 OpenAPI에서 `src/shared/api/generated` 생성 (`OPENAPI_URL` 필요) |

## 테스트 배포 (`test.irummate.com`)

`test` 브랜치에 병합되면 자동으로 올라가는 확인용 배포다. 출시 앱과 같은 앱 빌드를 웹에 올려 사용자 화면과 관리자 화면을 모두 쓰고, test 서버에 연결한다. 운영 배포가 아니며 검색 노출은 막는다(`docs/adr/0006-dev-production-domains.md` 결정 6).

Vercel 프로젝트 설정:

- Framework Preset: `Vite`
- Root Directory: 저장소 루트
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Branch: `test`
- 도메인: `test.irummate.com`을 Production에 연결("Redirect apex domain to www"는 끔)
- `/api` 프록시와 `X-Robots-Tag` 헤더는 `vercel.json`이 정한다.

환경 변수(Production 환경에 넣는다. 값을 바꾸면 다시 배포해야 반영된다):

| 키 | 값 | 비고 |
| --- | --- | --- |
| `VITE_KAKAO_CLIENT_ID` | 카카오 REST API 키 | 필수. test 서버의 `KAKAO_CLIENT_ID`와 같은 값 |
| `VITE_KAKAO_REDIRECT_URI` | `https://test.irummate.com/oauth/kakao/callback` | 필수. test 서버의 `KAKAO_REDIRECT_URI`와 같은 값 |
| `VITE_INQUIRY_OPENCHAT_URL` | 문의용 오픈채팅 주소 | MY 화면 문의 |
| `VITE_SOCKET_URL` | test 서버의 채팅 소켓 주소 | Vercel 리라이트는 소켓을 넘기지 못하므로 서버 주소를 직접 쓴다 |
| `VITE_API_BASE_URL` | 넣지 않음 | 비우면 같은 출처의 `/api`(Vercel 리라이트)를 쓴다 |
| `VITE_ENABLE_MSW` | 넣지 않음 | 넣으면 가짜 서버로 동작한다 |

`VITE_API_PROXY_TARGET`·`OPENAPI_URL`은 개발 서버·`gen:api` 전용이라 넣지 않는다. 카카오 Client Secret은 서버에만 둔다(`VITE_` 변수는 빌드 결과에 그대로 들어간다).

## MSW 화면 검수 (Vercel Preview)

서버 없이 가짜 데이터로 화면을 볼 때는 별도 Vercel 프로젝트의 Preview 배포를 쓴다. 설정은 테스트 배포와 같고, Preview 환경 변수에 `VITE_ENABLE_MSW=true`만 둔다.

MSW 시나리오는 주소의 쿼리로 고른다.

- 인증 완료: `?session=certified`
- 비로그인: `?session=anonymous`
- 가입 중: `?session=onboarding&stage=terms`

운영용 관리자 웹 Vercel 프로젝트(출시 때 만듦)는 `npm run build:admin-web`과 `dist-admin-web/`을 사용한다.

## 구조

```text
src/
├── app/       # 앱 조립: 진입점, Provider, 라우터(paths·routes·guards), 레이아웃
├── pages/     # 라우트 1개 = 파일 1개, 조립만
├── features/  # 도메인 단위. 바깥에는 index.ts만 공개
├── shared/    # 도메인을 모르는 공통 계층 (api, platform, ui, styles, lib, config, assets)
└── test/      # 테스트 공통: setup, 렌더 도우미, MSW
```

의존 방향은 `app → pages → features → shared` 한 방향이며 ESLint가 검사합니다.
