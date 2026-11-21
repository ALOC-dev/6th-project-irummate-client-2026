import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { BrandIcon, EmptyState, FilterChip, IconButton, PageHeader } from '@shared/ui';

import { createNotificationFixtures } from '../model/fixtures';
import {
  filterNotifications,
  groupNotificationsByDay,
  NOTIFICATION_FILTERS,
  notificationFilterLabel,
} from '../model/notifications';
import type { NotificationFilter, NotificationItem, NotificationMateKind } from '../model/types';
import { NotificationIcon } from './NotificationIcon';
import { NotificationRow } from './NotificationRow';
import { useGoBack } from './useGoBack';

/** 다른 feature의 아이콘은 페이지가 골라 넘긴다(feature끼리는 import하지 않는다). */
export interface NotificationListIcons {
  back: ReactNode;
  /** 매이트 알림: 모집글 분류 아이콘(매이트 게시판·채팅 목록과 같은 대응) */
  mate: (kind: NotificationMateKind) => ReactNode;
}

export interface NotificationListViewProps {
  icons: NotificationListIcons;
  now?: Date;
  items?: NotificationItem[];
}

export function NotificationListView({ icons, now: nowProp, items }: NotificationListViewProps) {
  const navigate = useNavigate();
  const goBack = useGoBack(paths.home);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [now] = useState(() => nowProp ?? new Date());
  const [fixtures] = useState(() => items ?? createNotificationFixtures(now));
  const groups = useMemo(() => groupNotificationsByDay(filterNotifications(fixtures, filter), now), [filter, fixtures, now]);

  // 채팅 목록 아이콘 타일과 같은 채워진 모양 아이콘을 쓴다.
  const iconOf = (item: NotificationItem): ReactNode => {
    if (item.category === 'dorm') return <BrandIcon name="office" />;
    if (item.category === 'mate') return icons.mate(item.mateKind ?? 'OTHER');
    return <NotificationIcon name="heart" />;
  };

  return (
    <main className="min-h-dvh break-keep pb-[calc(1.25rem+var(--safe-area-bottom))]">
      <h2 className="sr-only">HM-02 알림</h2>
      <PageHeader
        title="알림"
        titleSize="compact"
        align="center"
        leading={(
          <IconButton label="뒤로" variant="glass" size="sm" onClick={goBack}>
            <span className="size-5.5 text-fg-strong [&>*]:size-full">{icons.back}</span>
          </IconButton>
        )}
        actions={(
          <IconButton label="알림 설정" variant="ghost" size="sm" onClick={() => navigate(paths.notificationSettings)}>
            <NotificationIcon name="settings" className="size-5.5 text-fg-strong" />
          </IconButton>
        )}
      />

      <div className="mx-auto w-full max-w-[480px]">
        {/* 채팅 목록과 같은 칩. 가로 스크롤이 그림자를 자르지 않도록 아래 여백을 넉넉히 두고 음수 마진으로 되돌린다. */}
        <div role="group" aria-label="알림 분류" className="-mb-6 flex gap-2 overflow-x-auto px-5 pb-9 pt-3 [scrollbar-width:none]">
          {NOTIFICATION_FILTERS.map((value) => (
            <FilterChip key={value} selected={filter === value} onClick={() => setFilter(value)}>
              {notificationFilterLabel(value)}
            </FilterChip>
          ))}
        </div>

        <div>
          {groups.length === 0 ? (
            <EmptyState title="받은 알림이 없어요" description="새 소식이 오면 여기에 모아 둘게요." />
          ) : groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="m-0 px-5 pb-1 pt-4.5 text-caption font-bold text-fg-subtle">{group.label}</h2>
              {group.items.map((item, index) => (
                <Fragment key={item.id}>
                  {/* 구분선은 아이콘 오른쪽 글자 줄에 맞춘다: 여백 20 + 아이콘 44 + 간격 14 */}
                  {index > 0 ? <div aria-hidden="true" className="ml-19.5 h-px bg-border-subtle" /> : null}
                  <NotificationRow item={item} icon={iconOf(item)} now={now} />
                </Fragment>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
