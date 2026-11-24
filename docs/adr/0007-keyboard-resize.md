# 0007. 키보드가 열릴 때 웹뷰를 줄이고, 키보드 어댑터는 가려진 높이만 알린다

- 날짜: 2026-11-24
- 단계: 2단계 (기반)
- 상태: 결정됨(iOS 실기기 확인 남음)
- 결정한 사람: iaruok

## 배경

키보드 어댑터(`shared/platform/keyboard.ts`)는 앱에서 키보드 플러그인의 `keyboardHeight`(키보드 자체의 높이)를 `height`로 넘겼다. 그런데 키보드가 열리면 웹뷰가 이미 줄어든다.

- **iOS:** 키보드 플러그인(`@capacitor/keyboard`)의 `resize` 기본값이 `native`다. 키보드가 열리면 웹뷰 틀을 키보드 높이만큼 줄인다.
- **Android:** Capacitor 8의 SystemBars가 키보드가 열리면 웹뷰 아래에 키보드 높이만큼 여백을 넣는다. 매니페스트의 `windowSoftInputMode`가 `adjustNothing`이 아니면 이렇게 동작한다.

이 상태에서 화면이 `height`만큼 아래 여백을 더 주면 하단 고정 요소가 키보드 높이만큼 한 번 더 올라간다(두 번 밀림). 지금 `height`를 쓰는 화면은 없다. 다만 채팅 입력창(`sticky bottom-0`)과 메이트 작성 오버레이(`fixed inset-0`)처럼 하단에 붙은 화면이 바로 영향을 받는다.

## 검토한 방식 (iOS `Keyboard.resize`)

| 방식 | 키보드가 열리면 | 하단 고정 요소 | 판단 |
| --- | --- | --- | --- |
| `native` | 웹뷰 전체가 줄어든다 | `sticky`·`fixed bottom`·`dvh`가 저절로 키보드 위로 맞춰진다 | 채택. Android와 같은 동작 |
| `body` | `<body>` 높이만 줄어든다 | `fixed` 요소는 화면 기준이라 그대로다. 메이트 작성 오버레이 하단이 가려진다 | 제외 |
| `none` | 아무것도 줄지 않는다 | 화면마다 키보드 높이를 더해야 한다. Android는 이미 줄어 있어 플랫폼별 분기가 생긴다 | 제외 |

## 결정

1. **`capacitor.config.ts`에 `Keyboard.resize: 'native'`를 명시한다.** 기본값과 같지만, 화면 규칙이 이 값에 기대므로 설정에 드러나게 둔다. `Keyboard.resizeOnFullScreen`은 넣지 않는다(SystemBars가 경고한다).
2. **`KeyboardState.height`는 "키보드가 화면을 실제로 가리는 높이"다.** 키보드 자체의 높이가 아니다.
   - 앱(Android·iOS): 웹뷰가 이미 줄어 가리는 부분이 없으므로 항상 `0`이다.
   - 웹(테스트 배포의 모바일 브라우저 등): 화면 영역(visual viewport)이 줄어든 만큼이다. 계산 방식은 그대로다.
   - 필드 이름과 모양은 그대로다. 공개 계약(`shared/platform/index.ts`)은 바뀌지 않는다.
3. **화면 작성 규칙**
   - 하단 고정 요소는 `sticky`/`fixed bottom`과 safe-area 여백만 쓴다. 키보드 높이를 직접 더하지 않는다.
   - 여백이 꼭 필요하면 `height`만큼만 준다. 앱에서는 0이라 영향이 없고, 웹에서는 가려진 만큼 올라간다.
   - `open`은 화면 모양을 바꿀 때 쓴다(예: 키보드가 열리면 하단 탭 숨기기, 채팅을 마지막 메시지로 스크롤).

## 확인할 것

- Android 실기기: 채팅 입력창과 메이트 작성 오버레이가 키보드 바로 위에 붙는다.
- iOS 실기기:
  - 같은 두 화면을 확인한다.
  - 키보드가 열렸을 때 하단 safe-area 여백(홈 막대 높이)이 입력창 아래에 남아 있지 않다.
  - 웹뷰가 줄어들 때 화면이 크게 끊기지 않는다.

## 다시 열 조건

- iOS에서 `native` 전환 시 화면 끊김이 심하거나 safe-area 여백이 겹쳐 남으면 결정을 다시 연다. 다른 방식으로 바꾸면 `height`의 앱 값과 화면 규칙을 함께 바꾼다.
- Android에서 `windowSoftInputMode`를 `adjustNothing`으로 바꾸면 웹뷰가 줄지 않는다. 이때도 다시 연다.
