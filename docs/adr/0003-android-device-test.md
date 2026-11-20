# 0003. Android·iOS 기기 시험 결과: 재발급 쿠키, 소켓 출처, 카카오 redirect URI

- 날짜: 2026-11-18 (Android), 2026-11-19 (iOS), 2026-11-20 (Android 재시험)
- 단계: 2단계 (기반) 첫 시험
- 상태: 확인 (Android 실기기는 Capacitor 7·8 모두, iOS 시뮬레이터 완료, 일부 항목은 아직)
- 결정한 사람: iaruok, uukdo

## 배경

2단계에서 통신·인증을 만들기 전에, 앱 환경에서 1학기 방식이 그대로 동작하는지 기기에서 확인해야 했다(0002 배경). 이 문서는 Android 실기기와 iOS 시뮬레이터 시험의 결과와 그에 따른 결정, 아직 시험하지 못한 항목을 남긴다. 재발급 토큰 방식(① 네이티브 HTTP 쿠키, ② 응답 본문 + 보안 저장소)은 두 플랫폼 결과가 모두 나온 뒤에 확정한다.

## 시험 조건

- Android 기기: Android 15 삼성 실기기 1대, 디버그 빌드, Capacitor 7.6.10, 네이티브 HTTP(`CapacitorHttp`) 켬
- Android 재시험(2026-11-20): Capacitor 8.6.2로 올린 빌드(`minSdk` 24, `targetSdk` 36)로 같은 다섯 항목을 Android 15 실기기에서 다시 확인했다.
- iOS 기기: iPhone 18 Pro 시뮬레이터(iOS 27.0) 1대, Xcode 27, 디버그 빌드, Capacitor 8.6.2, 네이티브 HTTP 켬
- 서버: test 서버(2학기 서버 `test` 브랜치 배포)
- 방법: 앱 시작 화면을 임시 시험 화면으로 바꿔 `fetch`로 호출했다. 이 화면은 병합하지 않고 `chore/cookie-probe` 브랜치에만 둔다(두 플랫폼에 같은 화면을 쓰기 위해).
- 카카오 인가 코드: 앱 연결(App Links·Universal Links) 없이 시험하기 위해, 기기의 브라우저(iOS는 시뮬레이터 Safari)에서 로그인한 뒤 404 화면 주소창의 `code` 값을 복사해 시험 화면에 붙여 넣었다. `code=` 뒤의 값만 넣어야 한다. `code=`까지 넣으면 서버가 400(`입력값이 유효하지 않습니다.`)을 돌려준다.

## 결과

| 시험 | Android (Capacitor 7, 11-18) | Android (Capacitor 8.6.2, 11-20) | iOS 시뮬레이터 (Capacitor 8.6.2, 11-19) |
| --- | --- | --- | --- |
| 코드 교환(`GET /api/auth/kakao/callback?code=`) 후 재발급 쿠키가 네이티브 쪽에 저장됨 | 통과 | 통과 | 통과 |
| 이어서 `POST /api/auth/refresh`에 쿠키가 실려 가 새 접근 토큰을 받음 | 통과 (403 없음) | 통과 (403 없음) | 통과 (403 없음) |
| 화면 코드에서 `document.cookie`로 재발급 쿠키를 읽을 수 없음 | 통과 | 통과 | 통과 |
| 앱을 완전히 종료한 뒤 다시 열어 `/refresh`를 불러도 쿠키가 실려 감 | 통과 | 통과 | 통과 |
| WebView가 `/ws/chat`에 직접 WebSocket 연결 | **실패** (`close code=1006`, 허용 목록 반영 전) | 통과 (허용 목록 반영 뒤) | 통과 (허용 목록 반영 뒤) |

iOS에서는 재발급 쿠키(`refreshToken`)가 앱의 네이티브 쿠키 저장소(`Library/Cookies`)에 test 서버 도메인으로 저장된 것도 확인했다.

Android 소켓 실패의 원인은 서버의 출처(Origin) 검사였다. 같은 서버에 출처만 바꿔 연결을 요청한 결과는 아래와 같다. 2026-11-19에 다시 요청했을 때는 앱 출처 두 개가 허용 목록에 들어가 있었다(결정 3 반영).

| 보낸 출처 | 2026-11-18 | 2026-11-19 |
| --- | --- | --- |
| `https://www.irummate.com` (허용 목록) | 400 (출처 검사는 통과) | 101 |
| 출처 없음 | 400 | 101 |
| `https://localhost` (Android 앱) | **403** | 101 |
| `capacitor://localhost` (iOS 앱) | **403** | 101 |
| 관계없는 출처(`https://evil.example.com`) | (요청 안 함) | 403 |

## 결정

1. **카카오 redirect URI는 `https://www.irummate.com/oauth/kakao/callback`을 쓴다.** 1학기 값이고 카카오 콘솔에 등록되어 있다. 서버는 redirect URI를 환경변수(`KAKAO_REDIRECT_URI`) 하나로만 받아 코드 교환에 쓰므로, 서버·카카오 콘솔·클라이언트 `.env`의 값이 같으면 서버 코드는 바꾸지 않는다. 카카오 복귀를 ① App Links·Universal Links로 확정하면 이 값이 그대로 확정되고, ② 카카오 네이티브 로그인으로 바꾸면 이 주소는 관리자 웹에만 쓴다.
2. **재발급은 ①(네이티브 쿠키)로 확정한다.** Android 실기기(Capacitor 7과 8.6.2 모두)와 iOS 시뮬레이터에서 네 항목이 모두 통과했다. iOS 실기기 시험에서 실패가 나오면 이 결정을 다시 연다. 그때도 두 플랫폼 중 하나라도 실패하면 둘 다 ②로 바꾼다.
3. **앱 출처를 서버의 WebSocket 허용 목록에 추가해 달라고 백엔드에 요청한다.** `WebSocketConfig`의 `setAllowedOriginPatterns`에 `https://localhost`(Android)와 `capacitor://localhost`(iOS)를 더한다. 재발급은 앱 출처에서도 403이 나지 않았으므로 CORS와 `AuthController.TRUSTED_ORIGINS`는 필수가 아니다(일관성을 위해 같이 넣을지는 백엔드가 정한다). 2026-11-19 기준 test 서버에 반영되어 있다.
4. **Capacitor를 8.6.2로 올린다.** Capacitor 7의 iOS 템플릿은 UIScene 방식을 쓰지 않는다. iOS 27부터는 UIKit이 이런 앱을 시작 직후 강제 종료한다(충돌 지점 `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`). 같은 빌드가 iOS 26.5에서는 실행되고 iOS 27.0에서는 종료됐다. Capacitor 8.5부터 UIScene을 지원하므로 8.6.2로 올리고 `ios/`에 `SceneDelegate`를 넣었다. 패키지 버전을 맞춰야 해서 `android/`도 함께 이전했다(compileSdk·targetSdk 36, `minSdk` 24). 빌드에는 JDK 21 이상이 필요하다.

## 아직 확인하지 못한 것

- 카카오 복귀 방식: 이 도메인에 프론트 배포와 앱 연결 파일(`assetlinks.json`, `apple-app-site-association`)이 필요한데, `www.irummate.com`은 시험 시점(2026-11-19 포함)에 404였다. 도메인 관리자 확인이 필요하다.
- 네이티브 HTTP를 켠 상태의 사진 업로드(S3): 발급 주소를 주는 API와 로그인 화면이 생긴 뒤에 시험한다.
- iOS 실기기: 서명(Apple Developer 계정)을 설정한 뒤 같은 시험 화면으로 확인한다.
- 서버 허용 목록의 `http://localhost.com:5173`이 `http://localhost:5173`의 오타인지 백엔드 확인 필요. 2026-11-19에 `http://localhost:5173` 출처는 403이었다.
- 접근 토큰 수명: 기본 15분, `.env.test.example` 예시 60분. 재발급 자동 갱신 시험에서 만료를 기다리지 않도록 test 서버 값을 확인한다.
- Android 15 외의 버전(`minSdk` 24인 Android 7부터 14까지)과 다른 제조사 기기는 시험하지 않았다.
