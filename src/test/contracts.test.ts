// 두 영역에서 함께 쓰는 계약 5종의 모양을 고정한다. 여기서 타입 오류가 나면 계약이 깨진 것이다.
import { describe, expectTypeOf, it } from 'vitest';

import { paths } from '@app/router/paths';
import { getAccessToken, useSession, type OnboardingStage, type SessionUser } from '@features/auth';
import { apiClient, AppError, type AppErrorKind } from '@shared/api';
import { externalBrowser, push, type Unsubscribe } from '@shared/platform';
import {
  Button,
  GlassCard,
  IconButton,
  TextField,
  type IconButtonProps,
  type TextFieldProps,
} from '@shared/ui';

describe('계약', () => {
  it('paths', () => {
    expectTypeOf(paths.home).toEqualTypeOf<'/home'>();
    expectTypeOf(paths.chatRoom).toEqualTypeOf<(roomId: string) => string>();
    expectTypeOf(paths.matePost).parameter(0).toBeString();
  });

  it('features/auth', () => {
    expectTypeOf<OnboardingStage>()
      .toEqualTypeOf<'login' | 'terms' | 'intro' | 'profile' | 'certification' | 'certified' | 'admin'>();
    expectTypeOf<SessionUser>()
      .toEqualTypeOf<{ id: number; name: string; dormRoom: string | null; stage: OnboardingStage }>();
    expectTypeOf(useSession).returns.toEqualTypeOf<{
      status: 'loading' | 'authenticated' | 'anonymous';
      user: SessionUser | null;
    }>();
    expectTypeOf(getAccessToken).returns.toEqualTypeOf<Promise<string | null>>();
  });

  it('shared/api', () => {
    expectTypeOf<AppErrorKind>()
      .toEqualTypeOf<'network' | 'auth' | 'forbidden' | 'conflict' | 'validation' | 'server'>();
    expectTypeOf<AppError>().toMatchTypeOf<{
      kind: AppErrorKind; message: string; fieldErrors?: Record<string, string>;
    }>();
    expectTypeOf(apiClient.get).toBeFunction();
  });

  it('shared/platform', () => {
    expectTypeOf(externalBrowser.open).toEqualTypeOf<(url: string) => Promise<void>>();
    expectTypeOf(push.onReceive)
      .toEqualTypeOf<(handler: (p: { type: string; targetId?: string }) => void) => Unsubscribe>();
  });

  it('shared/ui', () => {
    expectTypeOf(Button).toBeFunction();
    expectTypeOf(GlassCard).toBeFunction();
    expectTypeOf(IconButton).toBeFunction();
    expectTypeOf(TextField).toBeFunction();
    expectTypeOf<IconButtonProps['label']>().toBeString();
    expectTypeOf<TextFieldProps['label']>().toBeString();
  });
});
