# 0006. 개발용·운영용 도메인과 브랜치 분리(카카오 redirect URI·앱 연결·관리자 웹)

- 날짜: 2026-11-22
- 단계: 2단계 (기반)
- 상태: 결정됨 (2026-11-23, 백엔드의 DNS 연결·test 서버 redirect URI·카카오 콘솔 설정 완료)
- 결정한 사람: iaruok (브랜치 분리(결정 5)는 uukdo와 합의, 테스트 배포의 빌드 종류(결정 6)는 uukdo 확인 필요), 도메인은 백엔드 확인
- 바꾸는 결정: 0003 결정 1

## 배경

카카오 로그인 후 앱으로 돌아오는 방식으로 Android App Links·iOS Universal Links(이하 앱 연결)를 먼저 시험하기로 했다. 앱 연결에는 콜백 주소의 도메인에 앱 연결 파일 2개(`/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association`)가 있어야 한다. 서버는 카카오 redirect URI를 환경 변수 하나(`KAKAO_REDIRECT_URI`)로만 받으므로, 웹도 같은 콜백 주소를 써야 한다. 따라서 콜백 도메인에 웹 빌드(Vercel)를 올리고 앱 연결 파일도 함께 배포하는 구성이 가장 단순하다.

0003 결정 1은 redirect URI를 운영 도메인 `https://www.irummate.com/oauth/kakao/callback`으로 정했다. 그러나 개발 중에 운영 도메인에 관리자 웹을 올리면 다음 문제가 생긴다.

- 누구나 개발 중인 화면에 들어올 수 있고, 검색 엔진에 수집될 수 있다.
- `/api` 프록시가 운영 서버를 가리키면, 아무나 카카오로 로그인할 때 운영 DB에 사용자가 생긴다.
- Vercel 접근 보호(비밀번호)로 막으면 Google·Apple이 앱 연결 파일을 읽지 못하고 카카오의 콜백 이동도 막혀, 앱 연결이 동작하지 않는다.

## 결정

1. **개발용과 운영용 도메인을 나눈다.**

   | | 개발용 | 운영용 |
   | --- | --- | --- |
   | 도메인 | `test.irummate.com` | `www.irummate.com` |
   | Git 브랜치 | `test`(개발 통합 브랜치, 결정 5) | `main`(운영에 나간 코드) |
   | Vercel 배포 | 테스트용 Vercel 프로젝트, Production 브랜치 `test`, **앱 빌드**(사용자·관리자 화면 모두, 결정 6) | 운영용 Vercel 프로젝트(출시 때), Production 브랜치 `main`, 관리자 웹 빌드 |
   | `/api` 프록시 대상 | test 서버(`https://test-api.irummate.com`) | 운영 서버 |
   | 카카오 redirect URI | `https://test.irummate.com/oauth/kakao/callback` | `https://www.irummate.com/oauth/kakao/callback` |
   | 서버 `KAKAO_REDIRECT_URI` | test 서버에 개발용 값 | 운영 서버에 운영용 값 |
   | 앱 빌드 | 디버그 빌드 | 출시 빌드 |
   | 앱 연결 파일의 Android 인증서 지문 | 디버그 서명 | Play 앱 서명 |
   | 검색 노출 | 막음(`X-Robots-Tag: noindex, nofollow`) | 허용 |

   - Vercel에 `test.irummate.com`을 등록할 때 **Production**에 붙이고, 루트 도메인 리다이렉트 옵션("Redirect apex domain to www")은 끈다. Preview에 붙이면 Vercel 기본 접근 보호가 걸려 앱 연결 파일과 카카오 콜백이 막힌다. 리다이렉트 옵션을 켜면 `irummate.com`·`www.irummate.com`이 개발 프로젝트에 함께 붙는다.
   - 환경 변수는 Production 환경에 넣는다. Vercel의 "Production"은 이 프로젝트의 Production 브랜치(`test`) 배포라는 뜻이고, 연결 서버(test 서버)와 환경 변수로 개발용이 된다.
2. **`www.irummate.com`은 출시 전까지 연결하지 않는다.** 출시 준비 때 운영용 Vercel 프로젝트(Production 브랜치 `main`)를 만들고 아래를 정해 앱 연결 파일(출시 서명 지문)과 함께 올린다.
   - Vercel은 프로젝트당 Production 브랜치가 하나라, 운영과 테스트는 Vercel 프로젝트를 나눈다.
   - `www.irummate.com`은 운영 쪽 Production에 붙이고 루트 도메인 리다이렉트 옵션을 켠다(`irummate.com` → `www`). 루트 도메인을 다른 곳에서 쓰지 않는지 백엔드에 확인하고, 루트는 Vercel이 안내하는 A 레코드를 쓴다.
   - 카카오 redirect URI와 앱 연결 도메인은 `www`만 쓴다. 앱 연결 파일이 `www`에서 리다이렉트 없이 200으로 오는지 확인한다.
   - `/api` 프록시 대상은 `vercel.json` rewrite에 환경 변수를 쓸 수 없어, 환경마다 다르게 두려면 환경 변수를 읽어 넘기는 Vercel 함수가 필요하다. 출시 전까지는 test 서버 주소 하나만 둔다. 두 Vercel 프로젝트가 같은 `vercel.json`을 읽으므로, 운영 프로젝트를 만들 때 이 문제를 먼저 푼다.
3. **클라이언트는 빌드마다 다른 값을 쓴다.** 카카오 redirect URI는 이미 빌드 때 들어가는 환경 변수(`VITE_KAKAO_REDIRECT_URI`)라 코드 변경이 없다. Android `intent-filter`의 도메인은 빌드 종류(debug·release)별 값으로 두고, iOS Associated Domains도 빌드 설정별로 둔다(iOS는 uukdo).
4. 앱 연결로 카카오 복귀가 실제로 되는지는 개발용 도메인에서 기기 시험으로 확인한다. Android Custom Tabs·iOS 앱 안 브라우저가 리다이렉트로 들어온 콜백 주소를 앱에 넘기지 않으면, 카카오 네이티브 로그인(백엔드 API 추가 필요)으로 바꾼다. 결과는 별도 ADR로 남긴다.

5. **브랜치는 `test`(개발 통합)와 `main`(운영)으로 나눈다.**
   - 기능 브랜치는 `test`에서 만들고 PR로 `test`에 병합한다. 병합되면 테스트용 Vercel 프로젝트가 `test.irummate.com`에 자동 배포한다.
   - `main`은 `test` → `main` 출시 PR로만 바뀐다. 출시 PR은 두 사람 모두 확인하고 merge commit으로 병합한다(squash·rebase는 두 브랜치의 기록을 어긋나게 함).
   - `test`·`main` 모두 직접 push를 막고 CI 통과를 병합 조건으로 둔다. GitHub 기본 브랜치는 `test`로 바꿔 PR의 기준 브랜치가 자동으로 `test`가 되게 한다.
   - 이유: 배포 구조(테스트 = `test`, 운영 = `main`)와 브랜치의 뜻을 맞춘다. `main`을 개발 통합 브랜치로 두면 테스트 배포에 내보낼 때마다 누군가 `main`을 `test`에 따로 반영해야 하고, 운영 배포 브랜치를 출시 때 새로 정해야 한다.

6. **테스트 배포에는 관리자 웹 빌드가 아니라 앱 빌드를 올린다.**
   - 이유: 관리자 웹 빌드는 로그인·카카오 콜백·관리자 화면만 등록하고, 관리자가 아닌 계정은 로그인 화면으로 돌려보낸다. 그래서 테스트 배포에서 사용자 화면을 확인할 수 없다. 앱 빌드는 사용자 화면과 관리자 화면을 모두 등록하고, 출시 앱에 들어가는 것과 같은 빌드다.
   - 테스트 배포는 출시 앱과 같은 코드·같은 빌드로 동작하고, 연결 서버(test 서버)와 환경 변수 값만 다르다. MSW는 켜지 않는다.
   - 웹에서는 API 주소를 비워 같은 출처의 `/api`(Vercel 리라이트)로 test 서버에 보낸다. 재발급 쿠키는 관리자 웹과 같은 HttpOnly 쿠키 방식이다. 앱의 네이티브 HTTP 쿠키(①)는 웹에서 시험되지 않으므로, 재발급 확인은 계속 실기기에서 한다.
   - 배포 대상별 빌드는 아래와 같다. 실제 사용자는 스토어 앱만 쓰므로, 사용자가 받는 것은 어디서나 앱 빌드다.

     | 배포 대상 | 빌드 | 웹에서 사용자 화면 |
     | --- | --- | --- |
     | 스토어 앱(Android·iOS) | 앱 빌드 | 해당 없음 |
     | `test.irummate.com` | 앱 빌드 | 열림(확인용) |
     | `www.irummate.com` | 관리자 웹 빌드 | 막힘(관리자가 아니면 로그인 화면으로 돌려보냄) |

   - 운영 웹에는 관리자 웹 빌드를 그대로 쓴다. 앱 빌드는 관리자 웹 빌드의 화면을 모두 포함하지만, 운영 웹에 앱 빌드를 올리면 사용자 접근을 막는 코드를 새로 만들어야 한다. 관리자 웹 빌드는 사용자 화면 코드가 빌드 결과에서 빠져 이미 그 역할을 한다.
   - 운영용 사용자 웹은 만들지 않는다. 테스트 배포는 팀·백엔드 확인용 주소다.
   - 검색 노출 차단은 `vercel.json`의 `X-Robots-Tag` 헤더로 한다. `www.irummate.com`이 아닌 모든 주소(테스트 도메인, `*.vercel.app`)에 붙여, 운영 프로젝트가 같은 `vercel.json`을 읽어도 운영 도메인은 영향을 받지 않게 한다.
   - Vercel 설정과 넣을 환경 변수는 `README.md`의 "테스트 배포" 단락에 둔다.

## 영향

- 서버 코드는 바꾸지 않는다. test 서버의 환경 변수만 바꾼다.
- 작업 규칙(`AGENTS.md`의 작업 방식·PR 병합 규칙)과 CI(`push` 검사 대상에 `test` 추가)를 결정 5에 맞춘다.
- `AGENTS.md`의 배포 대상에 테스트 배포(앱 빌드, 결정 6)를 적는다. `vercel.json`에 `/api` 프록시와 검색 노출 차단 헤더를 둔다.
- 전환 시점에 열려 있는 PR은 기준 브랜치를 `test`로 바꾼다. 전환 전에 `test`를 `main`과 같은 위치로 맞춘다.
- 카카오 콘솔에 개발용 redirect URI와 Web 사이트 도메인을 추가한다(redirect URI는 여러 개 등록 가능).
- 개발 중 로그인 기록은 test 서버 DB에만 쌓인다.
- 0003에 적은 앱 기기 시험(fetch·axios 경로)은 브라우저에서 받은 코드를 붙여 넣는 방식이라, redirect URI 값이 바뀌어도 결과에 영향이 없다. 시험할 때는 test 서버의 redirect URI와 같은 주소로 카카오 인증을 시작해야 한다.

## 백엔드에 요청할 것

1~3, 5는 2026-11-23 완료. 4의 운영 서버 주소는 출시 준비 때 받는다.

1. `test.irummate.com` DNS를 Vercel이 안내하는 CNAME으로 연결. 이 주소를 지금 다른 서버(test API 등)가 쓰고 있지 않은지 확인
2. test 서버 `KAKAO_REDIRECT_URI`를 `https://test.irummate.com/oauth/kakao/callback`으로 변경
3. 카카오 콘솔에 위 redirect URI와 Web 사이트 도메인 `https://test.irummate.com` 추가(기존 `www` 주소는 유지)
4. 운영 서버의 API 주소 공유(test 서버는 `https://test-api.irummate.com`으로 확인함)
5. 운영 도메인 `www.irummate.com`의 DNS는 출시 전까지 그대로 둠
