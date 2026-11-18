import { describe, expect, it } from 'vitest';

import { botReply } from './botReply';
import { chatRoomFixtures, previewOf } from './fixtures';

const room = (id: string) => chatRoomFixtures.find((item) => item.id === id)!;

describe('chat model', () => {
  it.each([
    ['room-jia', '혹시 입사 전에 한 번 만나볼래요?'],
    ['room-dinner', '민지: 6시에 로비에서 봬요!'],
    ['room-team', '신고해 주셔서 감사해요. 검토 후 결과를 알려드릴게요.'],
  ])('previewOf(%s) → %s', (id, expected) => {
    expect(previewOf(room(id))).toBe(expected);
  });

  it('내가 마지막으로 보낸 메시지는 "나:"를 붙인다', () => {
    expect(previewOf(room('room-jia'), [{ id: 'x', roomId: 'room-jia', sender: 'me', text: '좋아요', sentAt: '14:10' }])).toBe('나: 좋아요');
  });

  it.each([
    ['신청 마감이 언제예요?', '2학기 룸메이트 신청은'],
    ['추천은 언제 바뀌어요?', '매일 자정에'],
    ['세탁기 고장났어요', '시설 문의는'],
    ['안녕', '아직 그 질문은'],
  ])('botReply(%s)는 %s로 시작한다', (text, prefix) => {
    expect(botReply(text).startsWith(prefix)).toBe(true);
  });
});
