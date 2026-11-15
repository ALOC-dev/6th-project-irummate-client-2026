import { describe, expect, it } from 'vitest';

import { estimateFeePerPerson } from './estimateFeePerPerson';

describe('estimateFeePerPerson', () => {
  it.each([
    { name: '미참여자는 참여할 경우를 반영한다', participating: 'NONE', now: 3, max: 5, expected: 4500 },
    { name: '이미 참여한 사용자를 다시 더하지 않는다', participating: 'JOINED', now: 4, max: 5, expected: 4500 },
    { name: '작성자를 다시 더하지 않는다', participating: 'MINE', now: 4, max: 5, expected: 4500 },
    { name: '마감된 모집의 정원을 넘겨 계산하지 않는다', participating: 'NONE', now: 4, max: 4, expected: 4500 },
  ] as const)('$name', ({ participating, now, max, expected }) => {
    expect(estimateFeePerPerson({
      estimatedFee: 18000,
      nowParticipants: now,
      maxParticipants: max,
      participating,
    })).toBe(expected);
  });
});
