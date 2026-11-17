# 0002. 네이티브 프로젝트와 iOS 빌드 분담

- 날짜: 2026-11-15
- 단계: 1단계 (계약·뼈대) 마무리, 2단계 (기반) 준비
- 상태: 결정됨
- 결정한 사람: iaruok, uukdo

## 배경

통신·인증 구현에 앞서 Android·iOS 실기기에서 두 가지를 시험해야 한다.

1. 앱 WebView에서 재발급 토큰 쿠키가 동작하는지(네이티브 HTTP)
2. 카카오 로그인 후 앱으로 돌아오는 방식

시험하려면 네이티브 프로젝트가 있어야 한다. 0001에서는 "앱 ID를 확정한 뒤 `android/`를 만든다"로 미뤄 두었고, iOS는 빌드 환경이 정해지지 않았다. iOS 앱은 macOS의 Xcode에서만 빌드·서명할 수 있는데, iaruok는 Windows를 쓰고 uukdo는 Mac을 쓴다.

## 결정

1. **앱 ID는 `com.irummate.app`으로 확정한다.** Android 패키지 이름과 iOS 번들 ID에 같이 쓴다. 스토어에 등록하면 바꿀 수 없고, 카카오 개발자 콘솔·App Links·Universal Links 등록에도 쓰이므로 외부에 등록하기 전인 지금 정한다. 0001 결과의 "앱 ID는 임시값"을 대체한다.
2. **`android/`를 만들어 커밋한다.** `npx cap add android`로 만든다. 웹 빌드 결과(`app/src/main/assets/public`)와 복사된 설정 파일은 Capacitor가 만든 `android/.gitignore`대로 커밋하지 않는다.
3. **네이티브 HTTP(`CapacitorHttp`)를 켠다.** 재발급 토큰 방식 ①(쿠키를 네이티브 쪽이 관리)의 전제다. 앱 안의 `fetch`·XHR이 모두 네이티브 HTTP로 나가며 Android·iOS에 함께 적용된다. 웹 빌드(브라우저·관리자 웹)에는 영향이 없다. WebSocket은 바뀌지 않는다. 실기기 시험에서 ①이 실패하면 ②(응답 본문 + 보안 저장소)로 바꾸고 이 설정을 다시 검토한다.
4. **iOS 빌드 환경은 uukdo의 Mac과 소모임의 Apple Developer 계정으로 한다.** uukdo는 소모임 팀 멤버로 등록되어 있고 인증서·프로필 권한이 있다. 새 계정은 만들지 않는다.
5. **iOS 작업은 아래처럼 나눈다.**
   - iaruok: `shared/platform`의 iOS 분기 코드 작성, iOS 시험 항목표·Xcode 설정값·권한 안내 문구 제공, CI의 iOS 빌드 확인
   - uukdo: Mac에서 `ios/` 생성(`npx cap add ios`), Xcode 설정 적용(서명 팀, Associated Domains, 권한 안내 문구), iOS 실기기 시험과 결과 공유, 필요할 때 Safari 웹 검사기로 WebView 디버깅
   - 코드는 iaruok가 쓰고, uukdo는 Mac이 꼭 필요한 작업만 맡는다. `ios/`·`android/`의 CODEOWNERS는 따로 두지 않고 공동 담당으로 둔다.
6. **`android/`의 Gradle은 8.14.7로 고정한다.** `npx cap add android`(`@capacitor/android` 7.6.10)가 만든 프로젝트는 Gradle 9.7.1과 Android Gradle Plugin(AGP) 8.13.2 조합인데, AGP 8.x가 쓰는 Gradle 내부 API가 Gradle 9.6.0에서 삭제되어 Sync가 `Failed to apply plugin 'com.android.internal.application'` 오류로 실패한다. AGP 8.13.2가 지원하는 8.14 계열의 최신 버전으로 `android/gradle/wrapper/gradle-wrapper.properties`의 `distributionUrl`을 바꿨다. Capacitor나 AGP를 올릴 때 이 값을 다시 확인한다.
7. **Android 자동 백업과 기기 간 전송에서 앱 데이터를 제외한다.** `AndroidManifest.xml`을 `allowBackup="false"`로 바꾸고, `dataExtractionRules`로 `cloud-backup`과 `device-transfer`를 모두 제외한다(`res/xml/data_extraction_rules.xml`). 재발급 토큰 쿠키는 WebView 저장소(`app_webview/Default/Cookies`)에 놓이는데, 이 폴더는 기본 백업 대상이라 복원된 다른 기기에서 로그인이 유지될 수 있었다. Android 12 이상은 일부 기기에서 `allowBackup="false"`만으로 기기 간 전송이 막히지 않으므로(공식 문서), 두 경로를 규칙으로 따로 막는다. 보안 저장소를 쓰는 방식 ②로 바뀌어도 같은 설정이 필요하다.
   - 수정 전 확인(Android 15 실기기, 디버그 빌드): `adb backup` 결과에 `Default/Cookies`가 들어 있었고, 한 기기에서 기기 간 전송을 흉내 낸 시험(`bmgr`의 `D2dTransport`)에서 앱 데이터 표식 파일과 쿠키 파일이 모두 복원되었다.
   - 설정별 시험(Android 15 실기기, 디버그 빌드): 규칙만 적용하면 클라우드 백업과 기기 간 전송이 모두 막힌다. `allowBackup="false"`만 적용하면 클라우드 백업은 막히지만, 기기 간 전송은 백업 단계에서 데이터가 전송 채널로 나간다(복원은 되지 않았으나 이유는 확인하지 못했다). 그래서 두 설정을 함께 둔다. 규칙은 Android 12 이상에만 적용되므로, Android 11 이하(`minSdk` 23)는 `allowBackup="false"`가 막는다.
   - 앱의 로컬 데이터는 소개 완료 표시 정도라서, 백업을 끄고 잃는 것이 거의 없다. 복원 후 소개 화면이 한 번 더 보일 수 있다.

## 결과

- `ios/`는 uukdo가 별도 PR로 만든다. CI의 iOS 빌드 확인은 `ios/`가 생긴 뒤 추가한다.
- iOS 로그인 방식(App Store 심사 지침 4.8)은 아직 결정 항목이다.
- 키보드·상태바 플러그인은 `shared/platform` 어댑터를 만들 때 추가한다.
- Gradle 버전을 올리거나 `android/`를 다시 만들면(`npx cap add android`) 결정 6과 7이 되돌아갈 수 있으므로, 만든 뒤 `gradle-wrapper.properties`와 `AndroidManifest.xml`의 백업 설정을 확인한다.
- 로그인을 만든 뒤에는 복원된 쿠키로 실제 로그인이 이어지는지도 확인한다. 이번 시험은 파일이 전송되는지만 확인했다.
