import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { NotificationSettingsView } from './NotificationSettingsView';

describe('NotificationSettingsView', () => {
  it('목 알림 설정을 보여주고 변경한다', async () => {
    render(<MemoryRouter><NotificationSettingsView /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '알림 설정' })).toBeInTheDocument();
    const marketing = screen.getByRole('switch', { name: /이벤트 및 혜택/ });
    expect(marketing).not.toBeChecked();
    await userEvent.click(marketing);
    expect(marketing).toBeChecked();
  });

  it('방해 금지를 켜면 시간 설정을 보여주고 저장한다', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><NotificationSettingsView /></MemoryRouter>);
    await user.click(screen.getByRole('switch', { name: /방해 금지 시간/ }));
    expect(screen.getByLabelText('시작')).toBeInTheDocument();
    expect(screen.getByLabelText('종료')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '설정 저장' }));
    expect(screen.getByRole('status')).toHaveTextContent('저장했어요');
  });
});
