import { ChatRoomView } from '@features/chat';
import { useParams } from 'react-router';

export default function ChatRoomPage() {
  const { roomId = '' } = useParams();
  return <ChatRoomView key={roomId} />;
}
