import { useState, type ReactNode } from 'react';

import { paths } from '@app/router/paths';
import { IconButton, PageHeader, Toast } from '@shared/ui';

import { notificationPreferenceDeviceOffFixture, notificationPreferenceFixture } from '../model/fixtures';
import { updatePreference } from '../model/notifications';
import type { NotificationPreferenceKey, NotificationPreferences } from '../model/types';
import { PreferenceRow } from './PreferenceRow';
import { useGoBack } from './useGoBack';

export interface NotificationSettingsIcons {
  back: ReactNode;
  close: ReactNode;
}

export interface NotificationSettingsViewProps {
  icons: NotificationSettingsIcons;
  /** 휴대폰 설정에서 이 앱의 알림을 허용했는지. 서버 연결 전에는 페이지가 정한다. */
  deviceNotificationsEnabled?: boolean;
  initialPreferences?: NotificationPreferences;
}

const ACTIVITY_ROWS: Array<{ key: NotificationPreferenceKey; label: string; hint?: string }> = [
  { key: 'chat', label: '채팅' },
  { key: 'matching', label: '매칭' },
  { key: 'mate', label: '매이트', hint: '참여·마감' },
  { key: 'dorm', label: '생활관 공지' },
];

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="bg-surface-card pb-2">
      {title ? <h2 className="m-0 px-5 pb-1.5 pt-4.5 text-body-sm font-bold text-fg-subtle">{title}</h2> : <div className="h-2" />}
      {children}
    </section>
  );
}

export function NotificationSettingsView({
  icons,
  deviceNotificationsEnabled = true,
  initialPreferences,
}: NotificationSettingsViewProps) {
  const goBack = useGoBack(paths.my);
  const [preferences, setPreferences] = useState(
    () => initialPreferences ?? (deviceNotificationsEnabled ? notificationPreferenceFixture : notificationPreferenceDeviceOffFixture),
  );
  const [bannerOpen, setBannerOpen] = useState(!deviceNotificationsEnabled);
  const [toast, setToast] = useState('');

  const change = (key: NotificationPreferenceKey) => (checked: boolean) =>
    setPreferences((current) => updatePreference(current, key, checked));
  const { paused } = preferences;

  return (
    <main className="min-h-dvh break-keep pb-[calc(2rem+var(--safe-area-bottom))]">
      <h2 className="sr-only">MY-05 알림 설정</h2>
      <PageHeader
        title="알림 설정"
        titleSize="compact"
        align="center"
        leading={(
          <IconButton label="뒤로" variant="glass" size="sm" onClick={goBack}>
            <span className="size-5.5 text-fg-strong [&>*]:size-full">{icons.back}</span>
          </IconButton>
        )}
      />

      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-2">
        {bannerOpen ? (
          <div className="flex items-start gap-3 border-b border-border-subtle bg-surface-card py-3.5 pl-5 pr-4">
            <p className="m-0 flex-1 text-body-sm leading-normal text-fg-muted">
              휴대폰 설정에서 알림이 꺼져 있어요.<br />
              알림을 받으려면 기기 알림을 허용해 주세요.<br />
              <button type="button" className="font-bold text-fg-link underline" onClick={() => setToast('기기 설정 열기는 준비 중이에요')}>
                설정으로 이동
              </button>
            </p>
            <IconButton label="안내 닫기" variant="ghost" className="-mt-1 size-8" onClick={() => setBannerOpen(false)}>
              <span className="size-4.5 text-fg-muted [&>*]:size-full">{icons.close}</span>
            </IconButton>
          </div>
        ) : null}

        <Section>
          <PreferenceRow label="푸시 알림 일시 중단" description="모든 알림 수신을 잠시 멈춰요" checked={paused} onChange={change('paused')} />
        </Section>

        <Section title="활동 알림">
          {ACTIVITY_ROWS.map(({ key, label, hint }) => (
            <PreferenceRow key={key} label={label} hint={hint} checked={preferences[key]} disabled={paused} onChange={change(key)} />
          ))}
        </Section>

        <Section title="혜택 알림">
          <PreferenceRow label="마케팅 정보 수신" hint="행사·혜택·이벤트" checked={preferences.marketing} disabled={paused} onChange={change('marketing')} />
          <PreferenceRow
            label="야간 혜택 알림"
            hint="21시–08시"
            checked={preferences.nightMarketing}
            disabled={paused || !preferences.marketing}
            onChange={change('nightMarketing')}
          />
        </Section>

        <p className="m-0 px-5 pt-1 text-caption leading-normal text-fg-subtle">
          채팅·매칭·공지 알림은 동의와 관계없이 받아요.<br />
          야간 혜택 알림은 마케팅 수신에 동의해야 켤 수 있어요.
        </p>
      </div>

      <Toast open={Boolean(toast)} onDismiss={() => setToast('')}>{toast}</Toast>
    </main>
  );
}
