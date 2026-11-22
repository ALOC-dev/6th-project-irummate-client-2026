// 시작 시 세션 확인 중 화면. 확인이 끝날 때까지 화면 이동을 하지 않는다(1학기의 화면 깜빡임 방지).
// v1.6 스플래시 디자인은 나중에 이 자리에 넣는다.
export function SessionSplash() {
  return (
    <main aria-busy="true" className="flex min-h-dvh items-center justify-center">
      <span className="sr-only">불러오는 중</span>
    </main>
  );
}
