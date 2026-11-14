import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  titleSize?: 'page' | 'bar';
}

export function PageHeader({
  title,
  eyebrow,
  leading,
  actions,
  sticky = true,
  titleSize = 'bar',
}: PageHeaderProps) {
  return (
    <header className={[
      'z-20 border-b border-border-subtle bg-glass-bar [backdrop-filter:var(--glass-filter)]',
      sticky ? 'sticky top-0' : '',
    ].join(' ')}>
      <div className="mx-auto flex min-h-16 w-full max-w-[480px] items-center gap-2 px-3">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0 flex-1 px-2">
          {eyebrow ? <p className="text-caption font-semibold text-fg-brand">{eyebrow}</p> : null}
          <h1 className={[
            'truncate font-extrabold tracking-irum-tight text-fg-strong',
            titleSize === 'page' ? 'text-title-1' : 'text-title-2',
          ].join(' ')}>{title}</h1>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
    </header>
  );
}
