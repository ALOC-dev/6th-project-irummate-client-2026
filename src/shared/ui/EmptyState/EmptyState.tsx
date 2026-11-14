import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-pill bg-primary-soft text-title-2 text-fg-brand">
          {icon}
        </div>
      ) : null}
      <h3 className="text-title-3 font-bold text-fg-strong">{title}</h3>
      {description ? <p className="mt-2 max-w-64 text-body-sm leading-6 text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
