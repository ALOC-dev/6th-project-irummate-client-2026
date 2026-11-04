# 0001. 프로젝트 뼈대의 구조 결정

- 날짜: 2026-11-04
- 상태: 결정됨
- 결정한 사람: iaruok

## 배경

2026-10-03의 JavaScript 뼈대를 TypeScript strict와 데이터 라우터 구조로 옮겼다. 옮기면서 AGENTS.md의 계층 규칙과 배포 대상을 지키려면 정해야 할 점이 있어 아래처럼 정했다.

## 결정

1. **가입 단계에 `intro`를 둔다.** 단계는 `login | terms | intro | profile | certification | certified | admin`이다. AGENTS.md의 가입 단계 규칙대로 소개 완료 표시(`introProgress`)를 판정 입력으로 쓰고, 관리자는 `admin` 단계로 둔다.
2. **빈 화면 표시 컴포넌트는 `src/pages/ScreenPlaceholder.tsx`에 둔다.** `app/router`에 두면 페이지가 `app`을 import하게 되어 "page는 app을 import하지 않습니다" 규칙에 걸린다.
3. **ESLint의 `FEATURES` 배열에 `admin`까지 feature 10개를 모두 넣는다.** 배열에서 빠진 feature는 다른 feature를 import해도 잡히지 않는다.
4. **`shared/config/env.ts`를 처음부터 최소 형태로 만든다.** 빌드 대상(`app`·`admin-web`)별 라우트 목록을 고르는 데 필요하다. 필수 값 검사는 나중에 더한다.
5. **v1.6 더미 데이터(fixtures)는 쓰는 화면을 만들 때 옮긴다.** 기본 정보는 프로필 화면, 추천 후보와 설문은 룸메이트 화면을 만들 때 옮긴다. 지금 MSW는 세션만 흉내 낸다.
6. **관리자 페이지는 `AdminGate` 안에서 `React.lazy`로 불러온다.** 데이터 라우터의 `lazy`는 가드가 막기 전에 모듈을 내려받으므로, "관리자 계정일 때만 관리자 묶음을 받는다"를 지키려면 가드가 통과시킨 뒤에 불러와야 한다.
7. **관리자 웹 빌드는 `dist-admin-web/`에 만든다.** 앱 빌드(`dist/`, Capacitor `webDir`)를 덮어쓰지 않게 한다.
8. **`app/router/paths.ts`만 pages·features의 import를 허용한다.** 의존 방향은 `app → pages → features → shared`지만, 화면 이동은 이 파일로만 하므로 계층 규칙의 유일한 예외로 둔다. 이 파일은 다른 `app` 코드를 import하지 않는다.
9. **기숙사 인증 관련 단계 이름은 서버와 1학기 코드에 맞춘다.** 인증 단계는 `certification`, 인증을 마친 단계는 `certified`로 쓴다. 서버 도메인(`Certification`, `CertificationStatus`, `/api/admin/certifications`)과 1학기 단계 이름(`CERTIFICATION`, `CERTIFIED`), 가드 이름(`CertifiedGate`)이 모두 이 이름을 쓴다. 화면 경로도 `paths.onboarding.certification`(`/onboarding/certification`)으로 맞춘다. 1학기 `SURVEY` 단계는 설문 위치가 정해지면 같은 이름(`survey`)으로 더한다.

## 결과

- `android/`는 팀이 앱 ID를 확정한 뒤 만든다. 그 전까지 `capacitor.config.ts`의 앱 ID는 임시값이다.
