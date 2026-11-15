import { describe, expect, it } from 'vitest';

import { compareDeadlineAt, isRecruitmentOpen, remainingParticipants } from './recruitmentRules';
import type { RecruitmentSummary } from './types';

const base: RecruitmentSummary = {
  recruitmentId: 1,
  category: 'MEAL',
  title: '',
  content: '',
  status: 'OPEN',
  authorNickname: '',
  activityAt: '2099-01-02T00:00:00',
  deadlineAt: '2099-01-01T00:00:00',
  nowParticipants: 2,
  maxParticipants: 3,
  full: false,
  createdAt: '2098-01-01T00:00:00',
  participating: 'NONE',
};

describe('recruitmentRules', () => {
  it('마감됐거나 마감시간이 지난 글을 제외한다', () => {
    expect(isRecruitmentOpen(base, new Date('2098-01-01').getTime())).toBe(true);
    expect(isRecruitmentOpen({ ...base, status: 'CLOSED' }, new Date('2098-01-01').getTime())).toBe(false);
    expect(isRecruitmentOpen(base, new Date('2100-01-01').getTime())).toBe(false);
  });

  it('마감시간이 빠른 글을 먼저 정렬한다', () => {
    const later = { ...base, recruitmentId: 2, deadlineAt: '2099-01-02T00:00:00' };
    expect([later, base].sort(compareDeadlineAt).map((post) => post.recruitmentId)).toEqual([1, 2]);
  });

  it('남은 자리를 계산한다', () => {
    expect(remainingParticipants(base)).toBe(1);
  });
});
