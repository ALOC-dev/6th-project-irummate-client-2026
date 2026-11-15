export interface DormNotice {
  id: string;
  title: string;
  source: string;
  postedAt: string;
  isNew?: boolean;
}

export interface DormEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  category: '생활' | '점검' | '행사';
}
