export interface DormNotice {
  id: string;
  title: string;
  source: string;
  postedAt: string;
  isNew?: boolean;
  url?: string;
}

export type DormEventCategory = '신청' | '점검' | '행사' | '생활';

export interface DormEvent {
  id: string;
  date: string;
  title: string;
  detail?: string;
  category: DormEventCategory;
}
