import type { ChatMessage, ChatRoomSummary } from './types';

export const chatRoomFixtures: ChatRoomSummary[] = [
  { id: 'room-sae-bom', name: '새봄', category: 'match', preview: '좋아요! 저도 조용한 시간 중요하게 생각해요.', lastAt: '오후 8:42', unread: 2, online: true },
  { id: 'room-running', name: '한강 러닝 메이트', category: 'mate', preview: '토요일 오전 9시에 2번 출구에서 만나요!', lastAt: '오후 7:18', unread: 1 },
  { id: 'room-dawon', name: '다온', category: 'match', preview: '생활 패턴 설문 다시 확인해 봤어요.', lastAt: '어제', unread: 0 },
  { id: 'room-water', name: '생수 공동구매', category: 'mate', preview: '주문 완료했습니다. 도착하면 알려드릴게요.', lastAt: '어제', unread: 0 },
  { id: 'room-admin', name: '이룸메이트 운영팀', category: 'admin', preview: '기숙사 인증이 완료되었어요.', lastAt: '11월 12일', unread: 0 },
];

export const chatMessageFixtures: ChatMessage[] = [
  { id: 'm1', roomId: 'room-sae-bom', sender: 'system', text: '새봄님과 매칭되었어요. 반갑게 인사해 보세요!', sentAt: '오후 8:31' },
  { id: 'm2', roomId: 'room-sae-bom', sender: 'other', text: '안녕하세요! 매칭돼서 반가워요 😊', sentAt: '오후 8:35' },
  { id: 'm3', roomId: 'room-sae-bom', sender: 'me', text: '저도 반가워요. 설문 보니까 생활 패턴이 비슷하더라고요!', sentAt: '오후 8:38' },
  { id: 'm4', roomId: 'room-sae-bom', sender: 'other', text: '좋아요! 저도 조용한 시간 중요하게 생각해요.', sentAt: '오후 8:42' },
  { id: 'm5', roomId: 'room-running', sender: 'system', text: '한강 러닝 메이트 모집에 참여했어요.', sentAt: '오후 7:02' },
  { id: 'm6', roomId: 'room-running', sender: 'other', text: '토요일 오전 9시에 2번 출구에서 만나요!', sentAt: '오후 7:18' },
];
