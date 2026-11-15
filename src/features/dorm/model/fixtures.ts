import type { DormEvent, DormNotice } from './types';

export const dormNoticeFixtures: DormNotice[] = [
  { id: 'notice-1', title: '2학기 룸메이트 신청 마감 안내', source: '생활관 행정실', postedAt: '09.26', isNew: true },
  { id: 'notice-2', title: '공용 냉장고 정리의 날 (9/30) — 이름 없는 식품은 폐기돼요', source: '생활관 자치회', postedAt: '09.25', isNew: true },
  { id: 'notice-3', title: '생활관 3층 세탁기 점검 (10/1 10:00–14:00)', source: '시설관리팀', postedAt: '09.24' },
  { id: 'notice-4', title: '생활관 가을 야식 파티 참가 신청', source: '생활관 자치회', postedAt: '09.22' },
  { id: 'notice-5', title: '외박 신청 방법 변경 안내 (앱 신청으로 전환)', source: '생활관 행정실', postedAt: '09.20' },
];

export const dormEventFixtures: DormEvent[] = [
  { id: 'event-1', date: '2026-11-14', title: '택배 보관함 정리', detail: '오후 6시 이후 장기 보관 택배를 정리해요.', category: '생활' },
  { id: 'event-2', date: '2026-11-16', title: '공용 세탁실 점검', detail: '오전 10시부터 12시까지 이용이 제한돼요.', category: '점검' },
  { id: 'event-3', date: '2026-11-20', title: '생활관 입주생 간담회', detail: '오후 7시 생활관 세미나실에서 진행해요.', category: '행사' },
  { id: 'event-4', date: '2026-11-27', title: '정기 소독', detail: '방역 시간에는 창문을 닫아 주세요.', category: '점검' },
];
