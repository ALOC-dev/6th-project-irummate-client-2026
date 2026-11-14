import { useEffect, useState, type FormEvent } from 'react';

import { Button, FilterChip, TextField } from '@shared/ui';

import { mateCategories, type MateCategory, type MatePostDraft } from '../model/types';

const INITIAL_DRAFT: MatePostDraft = {
  category: '밥',
  title: '',
  place: '',
  schedule: '',
  maxMembers: 2,
  price: '',
  priceMode: 'fixed',
};

interface MateComposeOverlayProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: MatePostDraft) => void;
}

export function MateComposeOverlay({ open, onClose, onSubmit }: MateComposeOverlayProps) {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const categories = mateCategories.filter((category): category is MateCategory => category !== '전체');
  const isPurchase = draft.category === '공동구매';
  const valid = draft.title.trim() && draft.schedule.trim() && (isPurchase || draft.place.trim());

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  if (!open) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onSubmit(draft);
    setDraft(INITIAL_DRAFT);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto [background:var(--app-background)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-[calc(1.25rem+var(--safe-area-bottom))] pt-[var(--safe-area-top)]">
        <header className="sticky top-0 z-10 -mx-5 flex min-h-16 items-center justify-between bg-glass-bar px-5 [backdrop-filter:var(--glass-filter)]">
          <button
            type="button"
            className="flex h-11 items-center rounded-pill px-2 text-body-sm font-semibold text-fg-body focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            onClick={onClose}
          >
            취소
          </button>
          <h2 className="text-title-3 font-bold text-fg-strong">매이트 모집하기</h2>
          <span className="w-14" aria-hidden="true" />
        </header>

        <form className="flex flex-1 flex-col pt-5" onSubmit={submit}>
          <fieldset>
            <legend className="mb-3 text-body-sm font-bold text-fg-strong">어떤 매이트를 찾나요?</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  selected={draft.category === category}
                  onClick={() => setDraft((current) => ({ ...current, category }))}
                >
                  {category}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 grid gap-5">
            <TextField
              label="모집 제목"
              placeholder={isPurchase ? '예: 생수 2L 24병 나눠 사요' : '예: 오늘 저녁 학식 같이 드실 분'}
              maxLength={60}
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
            {!isPurchase ? (
              <TextField
                label="만날 장소"
                placeholder="예: 학생회관 앞"
                value={draft.place}
                onChange={(event) => setDraft((current) => ({ ...current, place: event.target.value }))}
              />
            ) : null}
            <TextField
              label={isPurchase ? '모집 마감' : '만날 시간'}
              placeholder="예: 금요일 오후 7:00"
              value={draft.schedule}
              onChange={(event) => setDraft((current) => ({ ...current, schedule: event.target.value }))}
            />
            {isPurchase ? (
              <TextField
                label="총 금액"
                inputMode="numeric"
                placeholder="총 금액을 입력해 주세요"
                value={draft.price}
                onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value.replace(/\D/g, '').slice(0, 8) }))}
                helperText="참여 인원에 따라 1인 예상 금액을 계산해 드려요."
              />
            ) : null}
          </div>

          <fieldset className="mt-7">
            <legend className="mb-3 text-body-sm font-bold text-fg-strong">추가로 모집할 인원</legend>
            <div className="flex items-center justify-between rounded-control bg-glass-input p-2 ring-1 ring-inset ring-border-subtle">
              <button
                type="button"
                className="size-11 rounded-pill bg-surface-card text-title-2 text-fg-body shadow-xs disabled:opacity-40"
                disabled={draft.maxMembers <= 2}
                aria-label="인원 줄이기"
                onClick={() => setDraft((current) => ({ ...current, maxMembers: current.maxMembers - 1 }))}
              >−</button>
              <strong className="text-title-3 text-fg-strong">나 포함 {draft.maxMembers}명</strong>
              <button
                type="button"
                className="size-11 rounded-pill bg-surface-card text-title-2 text-fg-body shadow-xs disabled:opacity-40"
                disabled={draft.maxMembers >= 20}
                aria-label="인원 늘리기"
                onClick={() => setDraft((current) => ({ ...current, maxMembers: current.maxMembers + 1 }))}
              >+</button>
            </div>
          </fieldset>

          <Button type="submit" size="lg" fullWidth disabled={!valid} className="mt-auto translate-y-2">
            모집 글 올리기
          </Button>
        </form>
      </div>
    </div>
  );
}
