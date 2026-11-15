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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(var(--bottom-nav-gap)+var(--safe-area-bottom))]">
      <nav
        aria-label={label}
        className="pointer-events-auto mx-auto flex h-[var(--bottom-nav-height)] w-full max-w-[480px] items-center justify-around rounded-card bg-glass-nav px-2 shadow-lg ring-1 ring-inset ring-glass-edge [backdrop-filter:var(--glass-filter)]"
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              className={[
                'relative flex h-14 min-w-16 flex-col items-center justify-center gap-1 rounded-control px-3',
                'text-micro font-bold transition-[color,background-color,transform] duration-[var(--duration-fast)]',
                'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] active:scale-[var(--press-scale)]',
                active ? 'bg-primary-soft text-fg-brand' : 'text-fg-muted hover:bg-glass-soft',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <span className="flex size-6 items-center justify-center" aria-hidden="true">
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
