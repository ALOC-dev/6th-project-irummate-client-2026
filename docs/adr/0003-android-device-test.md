# 0003. Android 실기기 시험 결과: 재발급 쿠키, 소켓 출처, 카카오 redirect URI

- 날짜: 2026-11-18
- 단계: 2단계 (기반) 첫 시험
- 상태: 일부 확인 (Android 완료, iOS와 일부 항목은 아직)
- 결정한 사람: iaruok (iOS 결과는 uukdo의 시험 뒤에 추가)

## 배경

2단계에서 통신·인증을 만들기 전에, 앱 환경에서 1학기 방식이 그대로 동작하는지 실기기로 확인해야 했다(0002 배경). 이 문서는 Android 실기기 시험의 결과와 그에 따른 결정, 아직 시험하지 못한 항목을 남긴다. 재발급 토큰 방식(① 네이티브 HTTP 쿠키, ② 응답 본문 + 보안 저장소)은 두 플랫폼 결과가 모두 나온 뒤에 확정한다.

## 시험 조건

- 기기: Android 15 삼성 실기기 1대, 디버그 빌드, 네이티브 HTTP(`CapacitorHttp`) 켬
- 서버: test 서버(2학기 서버 `test` 브랜치 배포)
- 방법: 앱 시작 화면을 임시 시험 화면으로 바꿔 `fetch`로 호출했다. 이 화면은 병합하지 않고 `chore/cookie-probe` 브랜치에만 둔다(iOS 시험에 같은 화면을 쓰기 위해).
- 카카오 인가 코드: 앱 연결(App Links) 없이 시험하기 위해, 폰 브라우저에서 로그인한 뒤 404 화면 주소창의 `code` 값을 복사해 시험 화면에 붙여 넣었다.

## 결과

| 시험 | 결과 |
| --- | --- |
| 코드 교환(`GET /api/auth/kakao/callback?code=`) 후 재발급 쿠키가 네이티브 쪽에 저장됨 | 통과 |
| 이어서 `POST /api/auth/refresh`에 쿠키가 실려 가 새 접근 토큰을 받음 | 통과 (403 없음) |
| 화면 코드에서 `document.cookie`로 재발급 쿠키를 읽을 수 없음 | 통과 |
| 앱을 완전히 종료한 뒤 다시 열어 `/refresh`를 불러도 쿠키가 실려 감 | 통과 |
| WebView가 `/ws/chat`에 직접 WebSocket 연결 | **실패** (`close code=1006`) |

소켓 실패의 원인은 서버의 출처(Origin) 검사다. 같은 서버에 출처만 바꿔 연결을 요청한 결과는 아래와 같다.

| 보낸 출처 | 응답 |
| --- | --- |
| `https://www.irummate.com` (허용 목록) | 400 (출처 검사는 통과) |
| 출처 없음 | 400 |
| `https://localhost` (Android 앱) | **403** |
| `capacitor://localhost` (iOS 앱) | **403** |

## 결정

1. **카카오 redirect URI는 `https://www.irummate.com/oauth/kakao/callback`을 쓴다.** 1학기 값이고 카카오 콘솔에 등록되어 있다. 서버는 redirect URI를 환경변수(`KAKAO_REDIRECT_URI`) 하나로만 받아 코드 교환에 쓰므로, 서버·카카오 콘솔·클라이언트 `.env`의 값이 같으면 서버 코드는 바꾸지 않는다. 카카오 복귀를 ① App Links·Universal Links로 확정하면 이 값이 그대로 확정되고, ② 카카오 네이티브 로그인으로 바꾸면 이 주소는 관리자 웹에만 쓴다.
2. **Android에서 재발급 ①(네이티브 쿠키)은 통과로 본다. 확정은 iOS와 남은 항목 뒤에 한다.** 두 플랫폼 중 하나라도 실패하면 둘 다 ②로 바꾼다.
3. **앱 출처를 서버의 WebSocket 허용 목록에 추가해 달라고 백엔드에 요청한다.** `WebSocketConfig`의 `setAllowedOriginPatterns`에 `https://localhost`(Android)와 `capacitor://localhost`(iOS)를 더한다. 재발급은 앱 출처에서도 403이 나지 않았으므로 CORS와 `AuthController.TRUSTED_ORIGINS`는 필수가 아니다(일관성을 위해 같이 넣을지는 백엔드가 정한다).

## 아직 확인하지 못한 것

- 카카오 복귀 방식: 이 도메인에 프론트 배포와 앱 연결 파일(`assetlinks.json`, `apple-app-site-association`)이 필요한데, `www.irummate.com`은 시험 시점에 404였다. 도메인 관리자 확인이 필요하다.
- 네이티브 HTTP를 켠 상태의 사진 업로드(S3): 발급 주소를 주는 API와 로그인 화면이 생긴 뒤에 시험한다.
- iOS 전체: uukdo가 `ios/`를 만든 뒤 같은 시험 화면으로 확인한다.
- 소켓 허용 목록에 앱 출처가 추가된 뒤 채팅 소켓 재시험.
- 서버 허용 목록의 `http://localhost.com:5173`이 `http://localhost:5173`의 오타인지 백엔드 확인 필요.
- 접근 토큰 수명: 기본 15분, `.env.test.example` 예시 60분. 재발급 자동 갱신 시험에서 만료를 기다리지 않도록 test 서버 값을 확인한다.
- Android 11 이하(`minSdk` 23)와 다른 제조사 기기는 시험하지 않았다.
