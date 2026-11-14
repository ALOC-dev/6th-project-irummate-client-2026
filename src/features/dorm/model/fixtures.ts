import type { DormEvent, DormNotice } from './types';

export const dormNoticeFixtures: DormNotice[] = [
  { id: 'notice-1', category: '생활 안내', title: '동절기 생활관 난방 운영 안내', postedAt: '오늘', isNew: true },
  { id: 'notice-2', category: '시설', title: '공용 세탁실 정기 점검 일정', postedAt: '어제', isNew: true },
  { id: 'notice-3', category: '안전', title: '소방시설 점검 및 비상 대피 안내', postedAt: '11월 11일' },
  { id: 'notice-4', category: '행사', title: '생활관 입주생 간담회 참가 신청', postedAt: '11월 8일' },
];

export const dormEventFixtures: DormEvent[] = [
  { id: 'event-1', date: '2026-11-14', title: '택배 보관함 정리', detail: '오후 6시 이후 장기 보관 택배를 정리해요.', category: '생활' },
  { id: 'event-2', date: '2026-11-16', title: '공용 세탁실 점검', detail: '오전 10시부터 12시까지 이용이 제한돼요.', category: '점검' },
  { id: 'event-3', date: '2026-11-20', title: '생활관 입주생 간담회', detail: '오후 7시 생활관 세미나실에서 진행해요.', category: '행사' },
  { id: 'event-4', date: '2026-11-27', title: '정기 소독', detail: '방역 시간에는 창문을 닫아 주세요.', category: '점검' },
];
