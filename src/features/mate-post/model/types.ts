export const mateCategories = ['전체', '밥', '취미', '공동구매', '기타'] as const;
export type MateCategoryFilter = (typeof mateCategories)[number];
export type MateCategory = Exclude<MateCategoryFilter, '전체'>;
export type MateSort = 'new' | 'closing';

export interface MatePost {
  id: string;
  category: MateCategory;
  title: string;
  host: string;
  createdAtLabel: string;
  place?: string;
  schedule: string;
  currentMembers: number;
  maxMembers: number;
  description: string;
  price?: number;
  priceMode?: 'fixed' | 'split';
  bookmarked?: boolean;
  joined?: boolean;
}

export interface MatePostDraft {
  category: MateCategory;
  title: string;
  place: string;
  schedule: string;
  maxMembers: number;
  price: string;
  priceMode: 'fixed' | 'split';
}
