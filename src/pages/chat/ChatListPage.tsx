import { ChatListView } from '@features/chat';

import { PendingReviewGate } from '../PendingReviewGate';

export default function ChatListPage() {
  return (
    <PendingReviewGate screenId="CH-01" name="채팅 목록" feature="채팅" back>
      <ChatListView />
    </PendingReviewGate>
  );
}
