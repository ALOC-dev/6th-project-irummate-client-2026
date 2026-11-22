import { ChatRoomView } from '@features/chat';
import { useParams } from 'react-router';

import { PendingReviewGate } from '../PendingReviewGate';

export default function ChatRoomPage() {
  const { roomId = '' } = useParams();
  return (
    <PendingReviewGate screenId="CH-02" name="채팅방" feature="채팅" back>
      <ChatRoomView key={roomId} />
    </PendingReviewGate>
  );
}
