import { useEffect, type ReactNode } from 'react';

export interface ToastProps {
  open: boolean;
  children: ReactNode;
  onDismiss?: () => void;
  duration?: number;
  position?: 'page' | 'above-nav';
}

export function Toast({ open, children, onDismiss, duration = 2200, position = 'page' }: ToastProps) {
  useEffect(() => {
    if (!open || !onDismiss) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss, open]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-pill bg-glass-dark px-4 py-2.5 text-center text-body-sm font-semibold text-fg-on-brand shadow-lg',
        position === 'above-nav' ? 'bottom-[calc(var(--bottom-nav-clearance)+0.75rem)]' : 'bottom-[calc(1.25rem+var(--safe-area-bottom))]',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
