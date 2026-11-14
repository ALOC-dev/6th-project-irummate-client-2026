export interface DormNotice {
  id: string;
  category: '생활 안내' | '시설' | '안전' | '행사';
  title: string;
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
