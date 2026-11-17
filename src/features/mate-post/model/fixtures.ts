import type { MatePost } from './types';

const now = new Date();
const minutesAgo = (value: number) => new Date(now.getTime() - value * 60 * 1000).toISOString();
const hoursBefore = (iso: string, value: number) => new Date(new Date(iso).getTime() - value * 60 * 60 * 1000).toISOString();

function upcoming(hour: number, minute = 0) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  if (date.getTime() - now.getTime() < 2 * 60 * 60 * 1000) date.setDate(date.getDate() + 1);
  return date.toISOString();
}

function nextWeekday(weekday: number, hour: number, minute = 0) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  const ahead = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + Math.max(ahead, 2));
  return date.toISOString();
}

function tomorrowEnd() {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59).toISOString();
}

const dinner = upcoming(18);
const chicken = upcoming(22);
const running = nextWeekday(6, 7);
const boardGame = nextWeekday(5, 20);
const water = tomorrowEnd();

export const matePostFixtures: MatePost[] = [
  {
    recruitmentId: 1,
    category: 'MEAL',
    title: '오늘 저녁 학식 같이 드실 분',
    content: '수업 끝나고 편하게 저녁 먹어요. 처음 만나는 분도 환영해요!',
    status: 'OPEN',
    authorNickname: '민지',
    place: '생활관 1층 로비',
    activityAt: dinner,
    deadlineAt: hoursBefore(dinner, 1),
    nowParticipants: 2,
    maxParticipants: 4,
    full: false,
    createdAt: minutesAgo(10),
    participating: 'NONE',
    bookmarked: false,
  },
  {
    recruitmentId: 2,
    category: 'GROUP_BUY',
    title: '생수 2L 24병 나눠 사요',
    content: '생활관 로비에서 나눌 예정이에요. 인원이 모이면 바로 주문할게요.',
    status: 'OPEN',
    authorNickname: '도윤',
    activityAt: water,
    deadlineAt: water,
    estimatedFee: 19200,
    nowParticipants: 5,
    maxParticipants: 6,
    full: false,
    createdAt: minutesAgo(32),
    participating: 'NONE',
    bookmarked: false,
  },
  {
    recruitmentId: 3,
    category: 'HOBBY',
    title: '주말 한강 러닝 크루 모집',
    content: '5km 정도 천천히 달릴 예정이에요. 달린 뒤 근처에서 커피도 마셔요.',
    status: 'OPEN',
    authorNickname: '태린',
    place: '정문 집합',
    activityAt: running,
    deadlineAt: hoursBefore(running, 12),
    nowParticipants: 3,
    maxParticipants: 8,
    full: false,
    createdAt: minutesAgo(60),
    participating: 'NONE',
    bookmarked: false,
  },
  {
    recruitmentId: 4,
    category: 'MEAL',
    title: '치킨 반반 나눠 드실 분 (야식)',
    content: '반반 한 마리 시켜서 나눠 먹어요.',
    status: 'OPEN',
    authorNickname: 'Sora',
    place: '한빛관 휴게실',
    activityAt: chicken,
    deadlineAt: hoursBefore(chicken, 1),
    nowParticipants: 1,
    maxParticipants: 2,
    full: false,
    createdAt: minutesAgo(120),
    participating: 'NONE',
    bookmarked: false,
  },
  {
    recruitmentId: 5,
    category: 'HOBBY',
    title: '보드게임 같이 해요',
    content: '초보도 할 수 있는 게임 위주로 골라요.',
    status: 'OPEN',
    authorNickname: '하늘',
    place: '생활관 세미나실',
    activityAt: boardGame,
    deadlineAt: hoursBefore(boardGame, 6),
    nowParticipants: 4,
    maxParticipants: 6,
    full: false,
    createdAt: minutesAgo(26 * 60),
    participating: 'NONE',
    bookmarked: false,
  },
  {
    recruitmentId: 6,
    category: 'GROUP_BUY',
    title: '휴지 30롤 공구 (마감)',
    content: '인원이 다 모였어요.',
    status: 'OPEN',
    authorNickname: '수아',
    activityAt: water,
    deadlineAt: water,
    estimatedFee: 17400,
    nowParticipants: 6,
    maxParticipants: 6,
    full: true,
    createdAt: minutesAgo(50 * 60),
    participating: 'NONE',
    bookmarked: false,
  },
];
