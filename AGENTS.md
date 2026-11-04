# 이룸매이트 2학기 클라이언트 — 작업 규칙

기숙사 룸메이트 매칭과 밥·취미·공동구매 "메이트" 모집을 하는 앱이다. v1.6 디자인(IrumGlass)을 기준으로 1학기 웹 코드를 새 구조로 옮겨 만든다.
이 파일은 강현(iaruok)과 지원(uukdo)이 함께 사용하는 클라이언트 개발 규칙이다. 개인 지침은 각자의 `CLAUDE.local.md`에 둔다.

## 현재 상태

- 0단계 진행 중. 설정 파일(TypeScript strict, Vite, ESLint 계층 규칙, Vitest, Playwright, Capacitor, CI)은 옮겼다. 결정 기록은 `docs/adr/0001-stage0-skeleton.md`.
- iaruok 영역의 옛 JavaScript 뼈대는 지웠다. uukdo 영역의 옛 `.js`/`.jsx`(`features/chat`, `features/mate-post`, `shared/ui`, `shared/lib`, `pages/HomePage.jsx`, `app/socket`)는 uukdo가 정리할 때까지 남아 있으며, lint·typecheck·빌드 대상이 아니다. 새 규칙의 예시로 삼지 않는다.

## 스택

React · TypeScript(strict) · Vite · TanStack Query · React Router(데이터 라우터) · Tailwind v4(`@theme`) · Capacitor(Android·iOS) · Vitest + Testing Library · MSW · Playwright

## 배포 대상

- 사용자 서비스는 **Android·iOS 앱**으로 낸다. 사용자용 웹은 없다.
- 관리자 화면은 **앱과 관리자 웹** 두 곳에 있다.
  - 앱: 관리자 계정일 때만 관리자 화면 묶음을 지연 로딩한다.
  - 관리자 웹: Vercel에 올린다. 로그인·카카오 콜백·관리자 화면만 등록한다.
- 빌드 대상 값은 `app` 또는 `admin-web`이다. `shared/config/env.ts`에서만 읽는다.
- 앱 출시(Google Play·App Store)는 관리자 화면까지 모두 만든 뒤다.
- Android와 iOS는 같은 코드로 동작한다. 두 플랫폼의 차이(뒤로가기, 화면 가장자리, 키보드, 딥링크, 보안 저장소, 권한 안내 문구)는 \shared/platform과 각 네이티브 프로젝트 설정에서만 다룬다.
- iOS 빌드·서명은 macOS(Xcode)에서만 된다. iOS 빌드 환경과 iOS 로그인 방식(App Store 심사 지침 4.8)은 결정 항목이다. 정해지기 전에는 추측해서 만들지 않는다.

## 계층 규칙 (ESLint로 강제)

- 의존 방향은 한 방향이다: `app → pages → features → shared`.
- feature끼리 서로 import하지 않는다. 다른 feature는 그 feature의 `index.ts`(공개 API)로만 쓴다.
- 페이지는 조립만 한다. API 호출과 도메인 규칙은 feature에 둔다.
- 금지 패턴:
  - `shared/api` 밖에서 axios 사용
  - `shared/platform` 밖에서 Capacitor 사용
  - 임의 색상값(색은 디자인 토큰으로만)
  - `console` 출력
  - 경로 문자열 직접 작성(화면 이동은 `app/router/paths.ts`로만)
- 시트·오버레이는 URL 쿼리로 연다. 기록 뒤로가기(history back)로 닫혀야 한다. Android는 뒤로가기 버튼이 이 동작을 부르고, iOS에는 그런 버튼이 없으므로 화면 안에 닫기 수단(닫기 버튼, 바깥 영역 누르기)을 둔다.

## 인증·토큰 규칙 (반드시 지킨다)

- 접근 토큰은 **메모리에만** 둔다(`features/auth/model/tokenStorage.ts`). localStorage·sessionStorage·Preferences·보안 저장소에 쓰지 않는다.
- 앱을 시작하면 `AuthContext`가 재발급을 먼저 한 번 시도한다. 기기에서 토큰을 불러오는 단계는 없다.
- 재발급 토큰:
  - 앱은 **① 네이티브 HTTP(CapacitorHttp) 쿠키**가 기본이다. 실기기 시험에서 실패하면 **② 응답 본문 + 보안 저장소**로 바꾼다.
  - ①과 ②의 차이는 `shared/api/client`의 재발급 전용 부분과 `shared/platform/secureStorage`에만 둔다. 재발급 요청은 그 한 곳에서만 만든다.
  - 관리자 웹은 Vercel 프록시와 HttpOnly 쿠키(1학기 방식)를 쓴다.
- 401이 오면 재발급 후 1회만 재시도한다. 동시에 들어온 재발급 요청은 하나로 합친다. 로그아웃은 401·403일 때만 하고, 네트워크 끊김으로는 하지 않는다.
- 토큰·전화번호·학번은 로그나 오류 기록에 남기지 않는다.
- XSS 방지:
  - `dangerouslySetInnerHTML`을 쓰지 않는다.
  - 사용자가 넣은 링크는 `http`·`https`일 때만 링크로 만든다.
  - 사용자가 입력한 내용은 글자로만 표시한다.

## 가입 단계

- 단계는 `login → terms → intro → profile → certification → (인증 심사 중: 결정 항목) → certified`이고, 관리자는 `admin`이다.
- 단계 판정은 `features/auth/model/onboardingStage.ts`가 한다. 입력은 서버 상태와 소개 완료 표시(`introProgress`) 두 가지다.
  - 소개 완료 표시는 사용자별로 기기에 남긴다. 민감 정보가 아니다.
- 가입 화면은 다음 화면을 직접 정하지 않는다. 제출한 뒤 단계를 다시 판정해서 이동한다.
- 가드:
  - `AuthGate`: 로그인 여부
  - `OnboardingGate`: 가입 단계
  - `CertifiedGate`: certified 단계만 통과
  - `AdminGate`: admin 단계만 통과
- 가드는 화면을 나누는 용도다. 실제 권한은 서버가 검사한다.

## 소유권 (CODEOWNERS와 같다)

- **강현(iaruok)** (계정·룸메이트·관리자)
  - feature: `auth`, `terms`, `profile`, `verification`, `roommate`, `admin`
  - 공통 계층: `app`(`ChatSocketProvider` 제외), `shared/api`, `shared/platform`, `shared/config`
- **지원(uukdo)** (디자인 시스템·커뮤니티)
  - feature: `dorm`, `mate-post`, `chat`, `notification`
  - 공통 계층: `shared/styles`, `shared/ui`, `shared/lib`, `shared/assets`, `app/providers/ChatSocketProvider.tsx`
- 계약 파일은 바꿀 때 상대의 리뷰가 필요하다: `app/router/paths.ts`, `features/auth/index.ts`, `shared/api/index.ts`, `shared/platform/index.ts`, `shared/ui/index.ts`, `package.json`
- 계약을 바꿀 때는 선택 필드만 추가한다. 기존 이름은 바꾸지 않는다.
- 상대가 소유한 폴더는 고치지 않는다. 필요하면 PR 설명에 요청을 적는다.

## 공통 UI

**uukdo**가 shared/ui/index.ts에 공개한 공통 컴포넌트만 사용한다. 컴포넌트 목록과 사용 규칙은 uukdo가 관리한다.

## 작업 방식

- 브랜치는 기능 단위로 만든다(예: `feat/auth-token-storage`). 하루 한 번 이상 main 기준으로 rebase한다.
- PR 하나에는 화면 하나, 또는 같은 목적의 파일 묶음 하나(예: `shared/api`, 프로젝트 설정)를 담는다.
- 순수 함수(단계 판정, 금액 계산 등)는 테이블 테스트를 함께 만든다. API가 걸린 동작은 MSW로 시험한다.
- 커밋 전에 `lint`, `typecheck`, `test`를 통과시킨다.
- 구조나 방식이 바뀌는 결정은 `docs/adr/`에 남긴다.
- 백엔드에 없는 API는 MSW 핸들러로 요청·응답 모양을 먼저 정하고, 백엔드에 같이 전달한다.

## 보안

- v1.6 디자인 원본(HTML)은 `draft/`에 커밋해 두고 화면 구현의 기준으로 쓴다. 읽기 쉬운 사본은 `docs-private/design/v1.6-source/`에 있다.
- 이 저장소는 공개(public)다. 디자인 원본에 실제 개인정보나 키가 들어가지 않게 한다. 다음은 커밋하지 않는다:
  - `.env`
  - `docs-private/`
  - `CLAUDE.local.md`
- `.env`는 키 이름만 `.env.example`에 둔다.

## 명령어

- `npm run dev` / `npm run dev:admin-web`: 개발 서버 (앱 / 관리자 웹 빌드 대상)
- `npm run build` / `npm run build:admin-web`: 빌드 → `dist/` / `dist-admin-web/`
- `npm run lint`: ESLint (계층 규칙은 `src/test/eslint/boundaries.test.ts`로도 검사)
- `npm run typecheck`: TypeScript 검사 (`src`·`e2e`와 설정 파일)
- `npm test`: Vitest
- `npm run test:e2e`: Playwright (개발 서버 + MSW)
- `npm run gen:api`: 백엔드 OpenAPI → `src/shared/api/generated/schema.d.ts` (`OPENAPI_URL` 필요)

## PR 검토 및 병합 규칙

### 기본 원칙

- 모든 기능 변경은 PR을 통해 `main`에 병합한다.
- PR 작성자는 자신의 PR을 승인하거나 직접 병합하지 않는다.
- `iaruok`의 PR은 `uukdo`, `uukdo`의 PR은 `iaruok`가 검토한다.
- 상대 개발자의 승인(Approve) 1회와 필수 CI 통과 후 병합한다.
- 승인 이후 새로운 커밋이 추가되면 재검토를 받는다.

### Critical Review

다음 항목은 **필수 검토 대상**이며, 문제가 해결되기 전까지 병합할 수 없다.

1. **공통 계약 변경:** API, 라우팅, 공개 인터페이스 및 데이터 모델 변경
2. **소유권 변경:** 상대 개발자의 담당 영역을 수정하는 경우
3. **보안 변경:** 인증, 권한, 토큰 관리 및 민감정보 처리 로직 변경
4. **아키텍처 변경:** 프로젝트 구조, 전역 상태 관리, 핵심 라이브러리 변경
5. **기존 기능 영향:** 변경으로 기존 동작이 깨지거나 호환성이 손상되는 경우
6. **검증 실패:** 빌드, 타입 검사, 필수 테스트 및 CI 실패

### 변경 및 승인 절차

- 공통 계약 및 아키텍처 변경은 **구현 전에 상대 개발자와 합의**한다.
- 상대 개발자의 소유 영역을 수정해야 할 경우 사전에 협의한다.
- Breaking Change는 영향 범위와 마이그레이션 방안을 PR에 명시한다.
- 검토자가 Blocking Comment를 남기면 해결 및 재확인 전까지 병합하지 않는다.
- 구조적 의사결정은 `docs/adr/`에 기록한다.

### Merge Policy

- `main` 직접 push 금지
- 승인 없는 PR 병합 금지
- 필수 CI 실패 시 병합 금지
- 미해결 Blocking Comment가 있는 PR 병합 금지
- 승인 이후 코드 변경 시 재승인 필수
