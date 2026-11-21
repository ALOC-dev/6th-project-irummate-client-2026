import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { NotificationSettingsView } from './NotificationSettingsView';

const icons = { back: <svg />, close: <svg /> };

function renderSettings(deviceNotificationsEnabled?: boolean) {
  render(
    <MemoryRouter>
      <NotificationSettingsView icons={icons} deviceNotificationsEnabled={deviceNotificationsEnabled} />
    </MemoryRouter>,
  );
}

const toggle = (name: string) => screen.getByRole('switch', { name });

describe('NotificationSettingsView', () => {
  it('기본 시안: 활동 알림과 마케팅은 켜져 있고 야간 혜택은 꺼져 있다', () => {
    renderSettings();
    expect(screen.getByRole('heading', { level: 1, name: '알림 설정' })).toBeInTheDocument();
    expect(screen.queryByText(/휴대폰 설정에서 알림이 꺼져 있어요/)).not.toBeInTheDocument();
    expect(toggle('푸시 알림 일시 중단')).toHaveAttribute('aria-checked', 'false');
    for (const name of ['채팅', '매칭', '매이트', '생활관 공지', '마케팅 정보 수신']) {
      expect(toggle(name)).toHaveAttribute('aria-checked', 'true');
    }
    expect(toggle('야간 혜택 알림')).toHaveAttribute('aria-checked', 'false');
    expect(toggle('야간 혜택 알림')).toBeEnabled();
  });

  it('마케팅을 끄면 야간 혜택 알림도 꺼지고 누를 수 없다', async () => {
    renderSettings();
    await userEvent.click(toggle('야간 혜택 알림'));
    expect(toggle('야간 혜택 알림')).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle('마케팅 정보 수신'));
    expect(toggle('야간 혜택 알림')).toHaveAttribute('aria-checked', 'false');
    expect(toggle('야간 혜택 알림')).toBeDisabled();
  });

  it('일시 중단을 켜면 나머지 항목을 누를 수 없다', async () => {
    renderSettings();
    await userEvent.click(toggle('푸시 알림 일시 중단'));
    expect(toggle('채팅')).toBeDisabled();
    expect(toggle('마케팅 정보 수신')).toBeDisabled();
  });

  it('기기 알림 꺼짐 시안: 안내를 보여주고 닫을 수 있다', async () => {
    renderSettings(false);
    expect(screen.getByText(/휴대폰 설정에서 알림이 꺼져 있어요/)).toBeInTheDocument();
    expect(toggle('채팅')).toHaveAttribute('aria-checked', 'false');
    expect(toggle('야간 혜택 알림')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '설정으로 이동' }));
    expect(screen.getByRole('status')).toHaveTextContent('기기 설정 열기는 준비 중이에요');
    await userEvent.click(screen.getByRole('button', { name: '안내 닫기' }));
    expect(screen.queryByText(/휴대폰 설정에서 알림이 꺼져 있어요/)).not.toBeInTheDocument();
  });
});
