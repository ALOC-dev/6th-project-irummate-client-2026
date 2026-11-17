export type ChatCategory = 'all' | 'bot' | 'match' | 'mate' | 'admin';
export type ChatRoomCategory = Exclude<ChatCategory, 'all'>;
export type ChatMessageSender = 'me' | 'other' | 'system';
export type ChatRoomIcon = 'bot' | 'building' | 'dollar' | 'shield' | 'utensils';

export interface ChatRoomSummary {
  id: string;
  name: string;
  category: ChatRoomCategory;
  subtitle: string;
  lastAt: string;
  unread: number;
  icon?: ChatRoomIcon;
  pinned?: boolean;
  group?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: ChatMessageSender;
  text: string;
  sentAt: string;
  from?: string;
}
