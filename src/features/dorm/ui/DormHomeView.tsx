import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { externalBrowser } from '@shared/platform';
import { Toast } from '@shared/ui';

import { dormEventFixtures, dormNoticeFixtures } from '../model/fixtures';
import type { DormNotice } from '../model/types';
import { DormIcon } from './DormIcon';
import { LatestNoticeCard } from './LatestNoticeCard';
import { NoticeSection } from './NoticeSection';
import { ScheduleSection } from './ScheduleSection';

const REFRESH_MS = 1200;

interface DormHomeViewProps {
  roomLabel?: string;
  today?: Date;
}

export function DormHomeView({ roomLabel = '408호', today = new Date() }: DormHomeViewProps) {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<number | undefined>(undefined);
  const [latest] = dormNoticeFixtures;

  useEffect(() => () => window.clearTimeout(refreshTimer.current), []);

  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshTimer.current = window.setTimeout(() => {
      setRefreshing(false);
      setToast('최신 공지를 불러왔어요');
    }, REFRESH_MS);
  };

  const openNotice = (notice: DormNotice) => {
    setToast('원문 페이지로 이동해요');
    if (notice.url) void externalBrowser.open(notice.url).catch(() => setToast('원문 주소를 열 수 없어요'));
  };

  return (
    <main className="relative isolate min-h-dvh pb-[var(--bottom-nav-clearance)] pt-[var(--safe-area-top)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] [background:var(--gradient-page)]" />
      <h2 className="sr-only">HM-01 홈</h2>
      <header className="sticky top-0 z-20 bg-glass-bar shadow-[inset_0_-1px_0_var(--color-glass-edge)] [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-[var(--topbar-height)] w-full max-w-[480px] items-center gap-1 px-2">
          <h1 className="m-0 flex min-w-0 flex-1 items-center py-1 pl-3">
            <img src="/brand/irummate-wordmark-blue.png" alt="이룸매이트" className="block h-[26px] w-auto shrink-0" />
          </h1>
          <div className="flex justify-end gap-0.5">
            <button type="button" aria-label="채팅" className="relative inline-flex size-11 items-center justify-center rounded-pill bg-transparent text-fg-brand transition-transform duration-[var(--duration-fast)] active:scale-90 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]" onClick={() => navigate(paths.chats)}>
              <DormIcon name="chat" className="size-[22px]" />
            </button>
            <button type="button" aria-label="알림" className="relative inline-flex size-11 items-center justify-center rounded-pill bg-transparent text-fg-brand transition-transform duration-[var(--duration-fast)] active:scale-90 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]" onClick={() => navigate(paths.notificationSettings)}>
              <DormIcon name="bell" className="size-[22px]" />
              <span aria-hidden="true" className="absolute right-[9px] top-[9px] size-2 rounded-pill bg-danger ring-2 ring-fg-on-brand" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px]">
        <div className="px-5 pt-5">
          <p className="m-0 mt-1 inline-flex items-center gap-2 text-[18px] font-bold tracking-irum-normal text-fg-strong">
            <DormIcon name="building" className="size-6 text-fg-brand" />
            <span>생활관 · {roomLabel}</span>
          </p>
        </div>
        <div className="relative z-[1] mt-5 flex flex-col gap-7 px-5 pb-6">
          {latest ? <LatestNoticeCard notice={latest} onOpen={openNotice} /> : null}
          <NoticeSection notices={dormNoticeFixtures} refreshing={refreshing} onRefresh={refresh} onOpen={openNotice} />
          <ScheduleSection events={dormEventFixtures} today={today} />
        </div>
      </div>
      <Toast open={Boolean(toast)} position="above-nav" onDismiss={() => setToast('')}>
        {toast}
      </Toast>
    </main>
  );
}
