import type { ReactNode } from 'react';

export interface PageHeaderProps {
  /** 글자나 워드마크 이미지. 이미지는 alt를 넣어 제목으로 읽히게 한다. */
  title: ReactNode;
  eyebrow?: string;
  /** 제목 아래 한 줄 설명(예: 채팅방 상태). */
  subtitle?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  titleSize?: 'page' | 'bar' | 'compact';
  /** center: 제목을 가운데 두고 양옆 버튼 자리를 같은 너비로 맞춘다. */
  align?: 'start' | 'center';
}

const TITLE_SIZE: Record<NonNullable<PageHeaderProps['titleSize']>, string> = {
  page: 'text-title-1 font-extrabold',
  bar: 'text-title-2 font-extrabold',
  compact: 'text-body font-bold',
};

export function PageHeader({
  title,
  eyebrow,
  subtitle,
  leading,
  actions,
  sticky = true,
  titleSize = 'bar',
  align = 'start',
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <header className={[
      'z-20 bg-glass-bar pt-[var(--safe-area-top)] shadow-[inset_0_-1px_0_var(--color-glass-edge)] [backdrop-filter:var(--glass-filter)]',
      sticky ? 'sticky top-0' : '',
    ].join(' ')}>
      <div className="mx-auto flex min-h-[var(--topbar-height)] w-full max-w-[480px] items-center gap-1 px-2">
        {leading || centered ? <div className={['flex shrink-0 items-center gap-2', centered ? 'min-w-11' : ''].join(' ')}>{leading}</div> : null}
        <div className={['min-w-0 flex-1 px-2', centered ? 'text-center' : ''].join(' ')}>
          {eyebrow ? <p className="text-caption font-semibold text-fg-brand">{eyebrow}</p> : null}
          <h1 className={[
            'm-0 truncate tracking-irum-tight text-fg-strong',
            TITLE_SIZE[titleSize],
          ].join(' ')}>{title}</h1>
          {subtitle ? <p className="m-0 mt-0.5 truncate text-caption text-fg-muted">{subtitle}</p> : null}
        </div>
        {actions || centered ? <div className={['flex shrink-0 items-center justify-end gap-0.5', centered ? 'min-w-11' : ''].join(' ')}>{actions}</div> : null}
      </div>
    </header>
  );
}
