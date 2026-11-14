import { useEffect, useId, type ReactNode } from 'react';

export interface BottomSheetProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: BottomSheetProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-surface-overlay"
        aria-label="시트 닫기"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 max-h-[88dvh] w-full max-w-[480px] overflow-hidden rounded-t-sheet bg-glass-sheet shadow-lg [backdrop-filter:var(--glass-filter)]"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-pill bg-ink-200" aria-hidden="true" />
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div>
            <h2 id={titleId} className="text-title-2 font-bold tracking-irum-tight text-fg-strong">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-body-sm text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="-mr-1 flex size-11 shrink-0 items-center justify-center rounded-pill text-title-2 text-fg-muted transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            aria-label="닫기"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="max-h-[calc(88dvh-9rem)] overflow-y-auto px-5 pb-5">{children}</div>
        {footer ? (
          <footer className="border-t border-border-subtle bg-glass-sheet px-5 pb-[calc(1rem+var(--safe-area-bottom))] pt-3">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
