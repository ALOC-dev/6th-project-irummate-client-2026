import type { ChatMessage, ChatRoomSummary } from './types';

// 가짜 사용자 번호. 실제로는 서버의 사용자 ID가 들어온다.
const PEOPLE: Record<string, number> = { 지아: 1, 태린: 2, 민지: 3, 도윤: 4, 수아: 5, Sora: 6, 하늘: 7 };

export const chatRoomFixtures: ChatRoomSummary[] = [
  { id: 'bot', name: '이룸봇', category: 'bot', icon: 'bot', pinned: true, subtitle: '챗봇 · 24시간 자동 답변', lastAt: '', unread: 0 },
  { id: 'room-jia', name: '지아', category: 'match', peerId: PEOPLE['지아'], subtitle: '매칭 성사 · 생활 궁합 88%', lastAt: '방금', unread: 2 },
  { id: 'room-dinner', name: '오늘 저녁 학식 같이 드실 분', category: 'mate', icon: 'utensils', group: true, subtitle: '밥 메이트 · 3명 참여', lastAt: '10분 전', unread: 2 },
  { id: 'room-office', name: '생활관 행정실', category: 'admin', icon: 'building', subtitle: '운영 · 평일 09:00–18:00 답변', lastAt: '1시간 전', unread: 1 },
  { id: 'room-water', name: '생수 2L 24병 나눠 사요', category: 'mate', icon: 'dollar', group: true, subtitle: '공동구매 · 5명 참여', lastAt: '어제', unread: 0 },
  { id: 'room-taerin', name: '태린', category: 'match', peerId: PEOPLE['태린'], subtitle: '매칭 성사 · 생활 궁합 83%', lastAt: '어제', unread: 0 },
  { id: 'room-team', name: '이룸매이트 운영팀', category: 'admin', icon: 'shield', subtitle: '운영 · 신고 및 문의', lastAt: '3일 전', unread: 0 },
];

type Line = [roomId: string, from: string | null, text: string, sentAt: string];

const lines: Line[] = [
  ['bot', '이룸봇', '안녕하세요! 이룸봇이에요. 룸메이트 매칭, 신청 마감, 생활관 시설처럼 궁금한 걸 편하게 물어보세요.', '09:00'],
  ['room-jia', '지아', '안녕하세요! 매칭돼서 반가워요', '14:02'],
  ['room-jia', null, '저도요! 생활 패턴이 많이 비슷하더라고요', '14:05'],
  ['room-jia', '지아', '저도 11시면 불 꺼요 :)', '14:06'],
  ['room-jia', '지아', '혹시 입사 전에 한 번 만나볼래요?', '14:06'],
  ['room-dinner', '민지', '다들 오늘 학식 메뉴 보셨어요? 돈까스래요', '17:20'],
  ['room-dinner', '도윤', '오 좋네요', '17:24'],
  ['room-dinner', null, '저도 갈게요!', '17:30'],
  ['room-dinner', '민지', '6시에 로비에서 봬요!', '17:41'],
  ['room-office', '생활관 행정실', '안녕하세요, 생활관 행정실이에요. 2학기 룸메이트 신청은 10월 6일 23:59까지예요.', '09:00'],
  ['room-office', null, '룸메이트가 정해지면 따로 제출해야 하나요?', '10:12'],
  ['room-office', '생활관 행정실', '매칭이 성사되면 신청서에 자동으로 등록돼요. 따로 제출하지 않아도 돼요.', '10:20'],
  ['room-water', '도윤', '1인 3,200원이에요. 입금하시면 말씀해 주세요', '20:10'],
  ['room-water', null, '방금 보냈어요!', '20:31'],
  ['room-water', '도윤', '입금 확인했어요', '20:33'],
  ['room-taerin', '태린', '아침 수업이 많아서 7시쯤 일어나요', '21:02'],
  ['room-taerin', null, '저도 비슷해요. 알람은 진동으로 해요', '21:10'],
  ['room-taerin', '태린', '내일 오후에 시간 괜찮아요?', '21:12'],
  ['room-team', null, '모집 글에 부적절한 내용이 있어 신고했어요.', '11:40'],
  ['room-team', '이룸매이트 운영팀', '신고해 주셔서 감사해요. 검토 후 결과를 알려드릴게요.', '11:52'],
];

export const chatMessageFixtures: ChatMessage[] = lines.map(([roomId, from, text, sentAt], index) => ({
  id: `m${index + 1}`,
  roomId,
  sender: from ? 'other' : 'me',
  text,
  sentAt,
  ...(from ? { from } : {}),
  ...(from && PEOPLE[from] !== undefined ? { fromId: PEOPLE[from] } : {}),
}));

export function previewOf(room: ChatRoomSummary, messages: ChatMessage[] = chatMessageFixtures): string {
  const last = messages.filter((message) => message.roomId === room.id).at(-1);
  if (!last) return '';
  if (last.sender === 'me') return `나: ${last.text}`;
  return room.group && last.from ? `${last.from}: ${last.text}` : last.text;
}
