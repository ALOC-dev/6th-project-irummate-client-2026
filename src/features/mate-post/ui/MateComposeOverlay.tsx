import { useEffect, useState, type FormEvent } from 'react';

import { Button, FilterChip, TextField } from '@shared/ui';

import {
  mateCategories,
  mateCategoryLabels,
  type MateCategory,
  type MatePostDraft,
} from '../model/types';
import { MateIcon } from './MateIcon';
import { mateCategoryIcon } from './mateCategoryStyle';

const INITIAL_DRAFT: MatePostDraft = {
  category: 'MEAL',
  title: '',
  content: '',
  place: '',
  activityAt: '',
  deadlineAt: '',
  maxParticipants: 1,
  estimatedFee: '',
};

function toLocalDateTimeInputValue(date: Date) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
  return new Date(localTime).toISOString().slice(0, 16);
}

interface MateComposeOverlayProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: MatePostDraft) => void;
}

export function MateComposeOverlay({ open, onClose, onSubmit }: MateComposeOverlayProps) {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const categories = mateCategories.filter((category): category is MateCategory => category !== 'ALL');
  const isPurchase = draft.category === 'GROUP_BUY';
  const activityAt = new Date(draft.activityAt).getTime();
  const deadlineAt = new Date(draft.deadlineAt).getTime();
  const minimumDateTime = toLocalDateTimeInputValue(new Date());
  const valid = Boolean(
    draft.title.trim()
    && draft.activityAt
    && draft.deadlineAt
    && activityAt > Date.now()
    && deadlineAt > Date.now()
    && deadlineAt < activityAt
    && (isPurchase || draft.place.trim()),
  );

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

  const cancel = () => {
    setDraft(INITIAL_DRAFT);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="작성 닫기" className="absolute inset-0 cursor-default bg-surface-overlay" onClick={cancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mate-compose-title"
        className={[
          'absolute inset-x-2 bottom-[calc(12px+var(--safe-area-bottom))] top-[calc(8px+var(--safe-area-top))] mx-auto flex max-w-[464px] items-center',
        ].join(' ')}
      >
        <div className="flex h-[min(600px,100%)] w-full flex-col overflow-hidden rounded-[32px] bg-glass-sheet shadow-lg [backdrop-filter:var(--glass-filter)]">
          <header className="flex h-[52px] shrink-0 items-center justify-between pl-4 pr-1.5 pt-1">
            <h2 id="mate-compose-title" className="m-0 text-title-3 font-bold tracking-irum-tight text-fg-strong">모집 글 작성</h2>
            <button
              type="button"
              aria-label="닫기"
              className="flex size-11 items-center justify-center rounded-pill text-fg-body hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
              onClick={cancel}
            >
              <MateIcon name="x" className="size-[22px]" />
            </button>
          </header>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-1 pt-1 [scrollbar-width:none]">
          <fieldset>
            <legend className="mb-2 text-body-sm font-semibold text-fg-strong">카테고리</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  selected={draft.category === category}
                  leading={<MateIcon name={mateCategoryIcon[category]} className="size-4" />}
                  onClick={() => setDraft((current) => ({ ...current, category }))}
                >
                  {mateCategoryLabels[category]}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4">
            <TextField
              label="모집 제목"
              placeholder={isPurchase ? '예: 생수 2L 24병 나눠 사요' : '예: 오늘 저녁 학식 같이 드실 분'}
              maxLength={60}
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
            <TextField
              label="모집 내용"
              placeholder="함께할 활동이나 참여 조건을 알려 주세요"
              maxLength={80}
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              helperText={`${draft.content.length}/80자`}
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
              label={isPurchase ? '수령·나눔 일시' : '활동 일시'}
              type="datetime-local"
              min={minimumDateTime}
              value={draft.activityAt}
              onChange={(event) => setDraft((current) => ({ ...current, activityAt: event.target.value }))}
            />
            <TextField
              label="모집 마감 일시"
              type="datetime-local"
              min={minimumDateTime}
              value={draft.deadlineAt}
              onChange={(event) => setDraft((current) => ({ ...current, deadlineAt: event.target.value }))}
              errorMessage={draft.activityAt && draft.deadlineAt && deadlineAt >= activityAt
                ? '모집 마감은 활동 일시보다 빨라야 해요.'
                : undefined}
            />
            {isPurchase ? (
              <TextField
                label="예상 비용"
                inputMode="numeric"
                placeholder="예상 비용을 입력해 주세요"
                value={draft.estimatedFee}
                onChange={(event) => setDraft((current) => ({ ...current, estimatedFee: event.target.value.replace(/\D/g, '').slice(0, 8) }))}
                helperText="참여 인원에 따라 1인 예상 금액을 계산해 드려요."
              />
            ) : null}
          </div>

          <fieldset>
            <legend className="mb-3 text-body-sm font-bold text-fg-strong">추가로 모집할 인원</legend>
            <div className="flex items-center justify-between rounded-control bg-glass-input p-2 ring-1 ring-inset ring-border-subtle">
              <button
                type="button"
                className="size-11 rounded-pill bg-surface-card text-title-2 text-fg-body shadow-xs disabled:opacity-40"
                disabled={draft.maxParticipants <= 1}
                aria-label="인원 줄이기"
                onClick={() => setDraft((current) => ({ ...current, maxParticipants: current.maxParticipants - 1 }))}
              >−</button>
              <strong className="text-title-3 text-fg-strong">추가 {draft.maxParticipants}명</strong>
              <button
                type="button"
                className="size-11 rounded-pill bg-surface-card text-title-2 text-fg-body shadow-xs disabled:opacity-40"
                disabled={draft.maxParticipants >= 19}
                aria-label="인원 늘리기"
                onClick={() => setDraft((current) => ({ ...current, maxParticipants: current.maxParticipants + 1 }))}
              >+</button>
            </div>
          </fieldset>

          </div>
          <div className="shrink-0 px-4 pb-4 pt-3">
            <Button type="submit" size="lg" fullWidth disabled={!valid}>
              모집 글 올리기
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
