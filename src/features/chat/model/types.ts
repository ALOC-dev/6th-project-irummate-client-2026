export type ChatCategory = 'all' | 'match' | 'mate' | 'admin';
export type ChatMessageSender = 'me' | 'other' | 'system';

export interface ChatRoomSummary {
  id: string;
  name: string;
  category: Exclude<ChatCategory, 'all'>;
  preview: string;
  lastAt: string;
  unread: number;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: ChatMessageSender;
  text: string;
  sentAt: string;
}
