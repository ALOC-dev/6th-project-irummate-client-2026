import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { Button, GlassCard, IconButton } from '@shared/ui';

import { notificationPreferenceFixture } from '../model/fixtures';
import type { NotificationPreferences } from '../model/types';
import { NotificationIcon } from './NotificationIcon';
import { PreferenceSwitch } from './PreferenceSwitch';

type ToggleKey = Exclude<keyof NotificationPreferences, 'quietStart' | 'quietEnd'>;

export function NotificationSettingsView() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(notificationPreferenceFixture);
  const [saved, setSaved] = useState(false);

  const update = (key: ToggleKey, checked: boolean) => {
    setPreferences((current) => ({ ...current, [key]: checked }));
    setSaved(false);
  };

  const goBack = () => {
    const routerIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (routerIndex > 0) navigate(-1);
    else navigate(paths.my, { replace: true });
  };

  return (
    <main className="min-h-dvh pb-[calc(1.25rem+var(--safe-area-bottom))] pt-[var(--safe-area-top)]">
      <h2 className="sr-only">MY-05 알림 설정</h2>
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-glass-bar [backdrop-filter:var(--glass-filter)]">
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center gap-2 px-3">
          <IconButton label="이전 화면" variant="ghost" onClick={goBack}><NotificationIcon name="arrow-left" className="size-6" /></IconButton>
          <h1 className="text-title-2 font-bold tracking-irum-tight text-fg-strong">알림 설정</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-5 py-5">
        <GlassCard className="mb-5 flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-fg-brand"><NotificationIcon name="bell" className="size-6" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-body font-bold text-fg-strong">전체 알림</h2>
            <p className="mt-1 text-caption text-fg-muted">기기에서 받을 이룸메이트 알림을 관리해요.</p>
          </div>
          <label>
            <span className="sr-only">전체 알림</span>
            <input type="checkbox" role="switch" className="peer sr-only" checked={preferences.enabled} onChange={(event) => update('enabled', event.target.checked)} />
            <span aria-hidden="true" className="relative block h-8 w-13 rounded-pill bg-ink-200 transition-colors peer-checked:bg-primary peer-focus-visible:shadow-[var(--focus-ring)] after:absolute after:left-1 after:top-1 after:size-6 after:rounded-pill after:bg-surface-card after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </GlassCard>

        <h2 className="mb-2 px-1 text-body-sm font-bold text-fg-strong">알림 종류</h2>
        <GlassCard padding="none" className="overflow-hidden divide-y divide-border-subtle">
          <PreferenceSwitch label="룸메이트 매칭" description="새 추천, 좋아요, 매칭 결과를 알려드려요." checked={preferences.roommateMatch} disabled={!preferences.enabled} onChange={(checked) => update('roommateMatch', checked)} />
          <PreferenceSwitch label="매이트 활동" description="참여한 모집의 변경과 마감 소식을 알려드려요." checked={preferences.mateActivity} disabled={!preferences.enabled} onChange={(checked) => update('mateActivity', checked)} />
          <PreferenceSwitch label="채팅 메시지" description="새 메시지를 놓치지 않도록 알려드려요." checked={preferences.chatMessage} disabled={!preferences.enabled} onChange={(checked) => update('chatMessage', checked)} />
          <PreferenceSwitch label="생활관 공지" description="새 공지와 중요한 일정을 알려드려요." checked={preferences.dormNotice} disabled={!preferences.enabled} onChange={(checked) => update('dormNotice', checked)} />
          <PreferenceSwitch label="이벤트 및 혜택" description="선택한 경우에만 서비스 소식을 보내요." checked={preferences.marketing} disabled={!preferences.enabled} onChange={(checked) => update('marketing', checked)} />
        </GlassCard>

        <h2 className="mb-2 mt-7 px-1 text-body-sm font-bold text-fg-strong">방해 금지</h2>
        <GlassCard padding="none" className="overflow-hidden">
          <PreferenceSwitch label="방해 금지 시간" description="설정한 시간에는 알림 소리를 줄여요." checked={preferences.quietHours} disabled={!preferences.enabled} onChange={(checked) => update('quietHours', checked)} />
          {preferences.quietHours && preferences.enabled ? (
            <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-4">
              <NotificationIcon name="moon" className="size-5 text-fg-muted" />
              <label className="flex-1 text-caption font-semibold text-fg-muted">시작<input type="time" className="mt-1 block w-full rounded-control bg-glass-input px-3 py-2 text-body-sm text-fg-strong ring-1 ring-inset ring-border-subtle" value={preferences.quietStart} onChange={(event) => setPreferences((current) => ({ ...current, quietStart: event.target.value }))} /></label>
              <span className="pt-5 text-fg-subtle">–</span>
              <label className="flex-1 text-caption font-semibold text-fg-muted">종료<input type="time" className="mt-1 block w-full rounded-control bg-glass-input px-3 py-2 text-body-sm text-fg-strong ring-1 ring-inset ring-border-subtle" value={preferences.quietEnd} onChange={(event) => setPreferences((current) => ({ ...current, quietEnd: event.target.value }))} /></label>
            </div>
          ) : null}
        </GlassCard>

        <Button size="lg" fullWidth className="mt-7" onClick={() => setSaved(true)}>설정 저장</Button>
        <p className={['mt-3 text-center text-body-sm font-semibold text-success transition-opacity', saved ? 'opacity-100' : 'opacity-0'].join(' ')} role="status">알림 설정을 저장했어요.</p>
      </div>
    </main>
  );
}
