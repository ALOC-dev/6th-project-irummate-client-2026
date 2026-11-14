import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { IconButton } from '@shared/ui';

import { dormEventFixtures, dormNoticeFixtures } from '../model/fixtures';
import { DormIcon } from './DormIcon';
import { NoticeSection } from './NoticeSection';
import { ScheduleSection } from './ScheduleSection';

export function DormHomeView() {
  const navigate = useNavigate();
  const [fetchedLabel, setFetchedLabel] = useState('5분 전');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setFetchedLabel('방금');
      setRefreshing(false);
    }, 500);
  };

  return (
    <main className="min-h-dvh pb-[var(--bottom-nav-clearance)] pt-[var(--safe-area-top)]">
      <h2 className="sr-only">HM-01 홈</h2>
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-glass-bar [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center justify-between px-5">
          <div>
            <p className="text-caption font-semibold text-fg-brand">오늘도 좋은 하루예요</p>
            <h1 className="text-title-1 font-extrabold tracking-irum-tight text-fg-strong">지원님</h1>
          </div>
          <div className="flex gap-1">
            <IconButton label="채팅 목록 열기" variant="ghost" onClick={() => navigate(paths.chats)}><DormIcon name="chat" className="size-5" /></IconButton>
            <IconButton label="알림 설정 열기" variant="ghost" onClick={() => navigate(paths.notificationSettings)}><DormIcon name="bell" className="size-5" /></IconButton>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-5 pb-6 pt-5">
        <div className="mb-5 flex items-center justify-between rounded-lg bg-glass-soft px-4 py-3 text-caption text-fg-muted shadow-xs ring-1 ring-inset ring-glass-edge">
          <span>생활관 홈페이지에서 {fetchedLabel} 가져왔어요.</span>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-pill text-fg-brand focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:opacity-50"
            aria-label="공지 새로고침"
            disabled={refreshing}
            onClick={refresh}
          >
            <DormIcon name="refresh" className={refreshing ? 'size-4 animate-spin motion-reduce:animate-none' : 'size-4'} />
          </button>
        </div>
        <NoticeSection notices={dormNoticeFixtures} />
        <ScheduleSection events={dormEventFixtures} />
      </div>
    </main>
  );
}
