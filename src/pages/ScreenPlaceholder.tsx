// 빈 화면 표시. 페이지를 실제로 만들 때 이 참조를 지운다.
// page가 app을 import할 수 없어 app/router 대신 pages에 둔다(docs/adr/0001).
interface ScreenPlaceholderProps {
  screenId: string;
  name: string;
}

export function ScreenPlaceholder({ screenId, name }: ScreenPlaceholderProps) {
  return (
    <main>
      <h1>
        {screenId} {name}
      </h1>
    </main>
  );
}
