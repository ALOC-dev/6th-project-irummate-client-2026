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
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  return (
    <main className="min-h-dvh pb-[var(--bottom-nav-clearance)] pt-[var(--safe-area-top)]">
      <h2 className="sr-only">HM-01 홈</h2>
      <header className="sticky top-0 z-20 bg-glass-bar shadow-[inset_0_-1px_0_rgb(255_255_255_/_60%)] [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-[var(--topbar-height)] w-full max-w-[480px] items-center justify-between pl-5 pr-2">
          <h1 className="relative h-[26px] w-[124px] overflow-hidden" aria-label="이룸매이트">
            <img
              src="/brand/irummate-wordmark-blue.png"
              alt=""
              className="absolute -left-[13px] -top-[17px] h-[62px] w-auto max-w-none mix-blend-multiply"
            />
          </h1>
          <div className="flex gap-1">
            <IconButton label="채팅 목록 열기" variant="ghost" onClick={() => navigate(paths.chats)}><DormIcon name="chat" className="size-6 text-fg-brand" /></IconButton>
            <span className="relative">
              <IconButton label="알림 설정 열기" variant="ghost" onClick={() => navigate(paths.notificationSettings)}><DormIcon name="bell" className="size-6 text-fg-brand" /></IconButton>
              <span className="absolute right-2 top-1.5 size-2.5 rounded-pill bg-danger ring-2 ring-glass-edge" aria-hidden="true" />
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] pb-6">
        <div className="px-5 pt-5">
          <div className="mt-1 inline-flex items-center gap-2 text-title-2 font-bold tracking-irum-normal text-fg-strong">
            <DormIcon name="building" className="size-6 text-fg-brand" />
            <span>생활관 · 408호</span>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-7 px-5 pb-6">
          <NoticeSection notices={dormNoticeFixtures} refreshing={refreshing} onRefresh={refresh} />
          <ScheduleSection events={dormEventFixtures} />
        </div>
      </div>
    </main>
  );
}
