import type { RecruitmentSummary } from './types';

export function isRecruitmentOpen(post: RecruitmentSummary, now = Date.now()) {
  return post.status === 'OPEN' && new Date(post.deadlineAt).getTime() > now;
}

export function compareDeadlineAt(a: RecruitmentSummary, b: RecruitmentSummary) {
  return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
}

export function remainingParticipants(post: RecruitmentSummary) {
  return Math.max(post.maxParticipants - post.nowParticipants, 0);
}
