import type { ReactNode } from 'react';

export interface BottomNavItem<Key extends string = string> {
  key: Key;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
}

export interface BottomNavProps<Key extends string = string> {
  items: readonly BottomNavItem<Key>[];
  activeKey: Key;
  onSelect: (key: Key) => void;
  label?: string;
}

export function BottomNav<Key extends string>({
  items,
  activeKey,
  onSelect,
  label = '하단 탭',
}: BottomNavProps<Key>) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(var(--bottom-nav-gap)+var(--safe-area-bottom))]">
      <nav
        aria-label={label}
        className="pointer-events-auto mx-auto flex h-[var(--bottom-nav-height)] w-full max-w-[448px] items-stretch gap-1 rounded-pill bg-glass-nav p-1.5 shadow-lg ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]"
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              className={[
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-pill',
                'text-[11.5px] transition-[color,background-color,box-shadow,transform] duration-[var(--duration-base)]',
                'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] active:scale-[var(--press-scale)]',
                active
                  ? 'bg-glass-soft font-bold text-fg-brand shadow-[inset_0_0_0_1.5px_var(--color-primary),0_0_12px_var(--color-primary-soft-hover)]'
                  : 'font-semibold text-ink-700 hover:bg-glass-soft',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <span className="flex size-[22px] items-center justify-center" aria-hidden="true">
                {active && item.activeIcon ? item.activeIcon : item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
