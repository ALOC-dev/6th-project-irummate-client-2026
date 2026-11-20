import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { externalBrowser } from '@shared/platform';
import { IconButton, PageHeader, Toast } from '@shared/ui';

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
    <main className="relative isolate min-h-dvh pb-[var(--bottom-nav-clearance)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] [background:var(--gradient-page)]" />
      <h2 className="sr-only">HM-01 홈</h2>
      <PageHeader
        title={<img src="/brand/irummate-wordmark-blue.png" alt="이룸매이트" className="block h-[var(--wordmark-height)] w-auto" />}
        actions={(
          <>
            <IconButton label="채팅" variant="ghost" size="sm" onClick={() => navigate(paths.chats)}>
              <DormIcon name="chat" className="size-[22px] text-fg-brand" />
            </IconButton>
            <IconButton label="알림" variant="ghost" size="sm" className="relative" onClick={() => navigate(paths.notificationSettings)}>
              <DormIcon name="bell" className="size-[22px] text-fg-brand" />
              <span aria-hidden="true" className="absolute right-[9px] top-[9px] size-2 rounded-pill bg-danger ring-2 ring-fg-on-brand" />
            </IconButton>
          </>
        )}
      />

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
