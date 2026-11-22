import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paths } from '@app/router/paths';
import { renderWithProviders } from '@test/renderWithProviders';

describe('ChatRoomPage', () => {
  it('다른 채팅방으로 이동하면 이전 방의 메시지를 초기화한다', async () => {
    // 심사 중 안내(useSession)가 있어 인증 Provider와 실제 라우트로 그린다. 세션 기본값은 인증 완료다.
    const { router } = renderWithProviders({ route: paths.chatRoom('room-jia') });
    expect(await screen.findByText('안녕하세요! 매칭돼서 반가워요')).toBeInTheDocument();

    await act(() => router.navigate(paths.chatRoom('room-taerin')));

    expect(await screen.findByRole('heading', { name: '태린' })).toBeInTheDocument();
    expect(screen.getByText('내일 오후에 시간 괜찮아요?')).toBeInTheDocument();
    expect(screen.queryByText('안녕하세요! 매칭돼서 반가워요')).not.toBeInTheDocument();
  });
});
