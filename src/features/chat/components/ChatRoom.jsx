export function ChatRoom({ room }) {
  return <article>{room?.name ?? '채팅방'}</article>;
}

