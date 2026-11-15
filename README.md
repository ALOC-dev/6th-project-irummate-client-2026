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

## 화면 검수용 Vercel Preview

백엔드 팀과 사용자 앱 화면을 검수할 때만 별도 Vercel 프로젝트의 Preview 배포를 사용한다.
사용자 서비스의 웹 배포 대상이 아니며, Production 환경에서는 MSW를 켜지 않는다.

- Framework Preset: `Vite`
- Root Directory: 저장소 루트
- Build Command: `npm run build`
- Output Directory: `dist`
- Preview 환경 변수: `VITE_ENABLE_MSW=true`

MSW 시나리오는 주소의 쿼리로 고른다.

- 인증 완료: `?session=certified`
- 비로그인: `?session=anonymous`
- 가입 중: `?session=onboarding&stage=terms`

관리자 웹 Vercel 프로젝트는 기존대로 `npm run build:admin-web`과 `dist-admin-web/`을 사용한다.

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
