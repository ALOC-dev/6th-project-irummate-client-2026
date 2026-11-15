export const mateCategories = ['ALL', 'MEAL', 'HOBBY', 'GROUP_BUY', 'OTHER'] as const;
export type MateCategoryFilter = (typeof mateCategories)[number];
export type MateCategory = Exclude<MateCategoryFilter, 'ALL'>;

export const mateCategoryLabels: Record<MateCategoryFilter, string> = {
  ALL: '전체',
  MEAL: '밥',
  HOBBY: '취미',
  GROUP_BUY: '공동구매',
  OTHER: '기타',
};

export type MateSort = 'new' | 'closing';
export type MateParticipation = 'MINE' | 'JOINED' | 'NONE';
export type MateRecruitmentStatus = 'OPEN' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';

export interface RecruitmentSummary {
  recruitmentId: number;
  category: MateCategory;
  title: string;
  content: string;
  status: MateRecruitmentStatus;
  authorNickname: string;
  place?: string;
  activityAt: string;
  deadlineAt: string;
  estimatedFee?: number;
  nowParticipants: number;
  maxParticipants: number;
  full: boolean;
  createdAt: string;
  participating: MateParticipation;
}

export interface MatePost extends RecruitmentSummary {
  bookmarked: boolean;
}

export interface MatePostDraft {
  category: MateCategory;
  title: string;
  content: string;
  place: string;
  activityAt: string;
  deadlineAt: string;
  /** 작성자를 제외하고 추가로 모집할 인원 */
  maxParticipants: number;
  estimatedFee: string;
}
