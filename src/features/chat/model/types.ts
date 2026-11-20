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
  /** 1:1 방 상대의 사람 번호. 프로필 색을 정한다. */
  peerId?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: ChatMessageSender;
  text: string;
  sentAt: string;
  from?: string;
  /** 보낸 사람의 사람 번호. 프로필 색을 정한다. */
  fromId?: number;
}
