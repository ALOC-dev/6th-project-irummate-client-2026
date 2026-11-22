# 0005. 세션 계약(SessionUser·Session)을 2학기 서버에 맞춤

- 날짜: 2026-11-22
- 단계: 2단계 (기반)
- 상태: 결정됨
- 결정한 사람: iaruok, uukdo

## 배경

1단계에서 `features/auth`의 공개 계약인 세션 사용자(`SessionUser`)를 `{ id: number; name; dormRoom; stage }`로 임시로 정했다. MSW가 이 모양을 그대로 돌려줬다. 2학기 서버의 인증 상태 응답(`GET /api/auth/status`)은 모양이 다르다.

- `user.id`: 사용자 번호를 서버가 해시로 바꾼 문자열이다(`HashIdsUtils`). 채팅 보낸 사람, 매칭 상대, 모집 참여자의 id도 같은 해시다.
- 이름은 `nickname`(가입 시 카카오 닉네임)만 있다. 실명(`realName`)은 기본 정보·프로필 API에만 있다.
- 호실이 없다.
- 비로그인은 401이 아니라 200 + `authenticated: false`다.

또 앱을 시작할 때 재발급이나 상태 조회가 네트워크 끊김·서버 오류로 실패할 수 있다. 이때 로그아웃 처리를 하면 안 되지만, 1단계의 세션 상태(`loading`·`authenticated`·`anonymous`)로는 이 경우를 화면에 알릴 수 없었다.

## 결정

1. **`SessionUser`를 `{ id: string; nickname: string; dormRoom: string | null; stage }`로 바꾼다.**
   - `id`는 서버 해시 문자열을 그대로 쓴다. 클라이언트는 해석하지 않고 비교·경로·요청에만 쓴다.
   - `name`은 `nickname`으로 바꾼다. 세션에는 화면에 보이는 이름만 두고, 실명은 필요한 화면이 프로필 API로 읽는다.
   - `dormRoom`은 필드를 남기되 값은 항상 `null`이다. 호실은 dorm 쪽 API에서 읽는다.
2. **`Session`에 선택 필드 `startError?: 'network' | 'server'`와 `retry?: () => void`를 더한다.**
   - 시작 시 확인이 연결 끊김(`network`)이나 서버 오류(`server`)로 실패하면 `status`는 `loading`인 채 `startError`가 생긴다. 로그인 화면으로 보내지 않는다.
   - `AuthGate`와 `EntryRedirect`는 이때 다시 시도 화면을 띄운다. `retry`를 부르면 확인을 다시 한다.
   - 재발급이 401·403이면 지금처럼 비로그인(`anonymous`)이다.
3. **MSW 인증 응답을 서버 모양으로 바꾼다.** 단계는 MSW가 정하지 않고, 클라이언트의 판정 함수(ADR 0004)가 서버 값으로 정한다. 개발 서버 주소의 시나리오(`?session=…&stage=…`)는 그대로 쓴다.

## 영향

- 호환이 깨지는 변경이다(`id` 타입, `name` 제거). 구현 전에 uukdo와 합의했다.
- 지금 `user.name`을 읽는 화면은 없다. `HomePage`의 `user?.dormRoom`은 `null`이 되어 `DormHomeView`의 기본 표시를 쓴다.
- 소개 완료 표시(`introProgress`)를 `features/auth`의 공개 API로 내보낸다. 소개 화면과 MSW 시나리오가 쓴다.
- 테스트 준비 파일(`src/test/setup.ts`)은 테스트마다 메모리의 접근 토큰을 비운다. Node 25에서 jsdom의 `localStorage`가 가려지는 문제(Node 자체의 `localStorage`가 전역에 생김)는 메모리 저장소로 바꿔 끼워 피한다. CI(Node 22)에서는 해당 없다.
