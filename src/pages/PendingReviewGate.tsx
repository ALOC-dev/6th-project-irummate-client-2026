import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@app/router/paths';
import { useSession } from '@features/auth';
import { ChatIcon } from '@features/chat';
import { MateIcon } from '@features/mate-post';
import { Button, GlassCard, IconButton, PageHeader } from '@shared/ui';

interface PendingReviewGateProps {
  /** 화면 ID와 이름. 안내를 띄워도 숨은 제목은 원래 화면 것을 둔다(라우트 테스트가 이 제목을 찾는다). */
  screenId: string;
  name: string;
  /** 막는 기능 이름. 머리글 제목과 안내 문구에 쓴다. */
  feature: '매칭' | '채팅';
  /** 탭 화면이 아니면 뒤로 버튼을 두고, 하단 탭 대신 기기 아래 여백만 둔다. */
  back?: boolean;
  children: ReactNode;
}

// 시안(irummate-verification-pending-draft): "요청 보냄"을 잠깐 보여 준 뒤 "확인 중"으로 넘기고, 안내 두 줄을 번갈아 보인다.
const SENT_MS = 1200;
const TIP_MS = 4000;
const TIPS = ['인증은 보통 하루 안에 끝나요.', '끝나면 알림으로 알려 드릴게요.'] as const;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ReviewStatus() {
  const [reduced] = useState(prefersReducedMotion);
  const [checking, setChecking] = useState(reduced);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    const sent = window.setTimeout(() => setChecking(true), SENT_MS);
    const tips = window.setInterval(() => setTip((index) => (index + 1) % TIPS.length), TIP_MS);
    return () => {
      window.clearTimeout(sent);
      window.clearInterval(tips);
    };
  }, [reduced]);

  const fade = 'absolute inset-0 flex items-center justify-center gap-2.5 transition-[opacity,transform] duration-500 ease-irum-out motion-reduce:transition-none';

  return (
    <GlassCard className="mt-6 self-stretch">
      <div role="status" className="relative h-10 overflow-hidden">
        <p className={[fade, 'm-0', checking ? '-translate-y-4 opacity-0' : 'opacity-100'].join(' ')} aria-hidden={checking}>
          <span className="flex size-[26px] items-center justify-center rounded-pill bg-success" aria-hidden="true">
            <MateIcon name="check" className="size-3.5 text-fg-on-brand" strokeWidth={3} />
          </span>
          <span className="text-body font-bold text-success">인증 요청을 보냈어요</span>
        </p>
        <p className={[fade, 'm-0', checking ? 'opacity-100' : 'translate-y-4 opacity-0'].join(' ')} aria-hidden={!checking}>
          <span className="size-[26px] animate-spin rounded-pill border-[3px] border-primary-soft-hover border-t-primary motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-body font-bold text-fg-link">운영팀이 확인하고 있어요</span>
        </p>
      </div>
      {reduced ? (
        <div className="mt-3.5 text-center text-body-sm leading-[22px] text-fg-muted">
          {TIPS.map((text) => <p key={text} className="m-0">{text}</p>)}
        </div>
      ) : (
        <>
          <p className="sr-only">{TIPS.join(' ')}</p>
          <p className="relative m-0 mt-3.5 h-[22px] text-center text-body-sm leading-[22px] text-fg-muted" aria-hidden="true">
            {TIPS.map((text, index) => (
              <span key={text} className={['absolute inset-0 transition-opacity duration-500', index === tip ? 'opacity-100' : 'opacity-0'].join(' ')}>
                {text}
              </span>
            ))}
          </p>
        </>
      )}
    </GlassCard>
  );
}

// 인증 심사 중(pending)에는 매칭·채팅 화면 대신 심사 중 안내를 띄운다(ADR 0004 결정 3).
// 여러 페이지가 함께 쓰고 page가 app을 import할 수 없어, ScreenPlaceholder처럼 pages에 둔다.
export function PendingReviewGate({ screenId, name, feature, back = false, children }: PendingReviewGateProps) {
  const { user } = useSession();
  const navigate = useNavigate();

  if (user?.stage !== 'pending') return children;

  // 채팅 목록과 같은 뒤로 가기: 앱 안에서 들어왔으면 이전 화면, 주소로 바로 열었으면 홈.
  const goBack = () => {
    const routerIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (routerIndex > 0) navigate(-1);
    else navigate(paths.home, { replace: true });
  };

  return (
    <main className={[
      'relative isolate flex min-h-dvh flex-col',
      back ? 'pb-[var(--safe-area-bottom)]' : 'pb-[var(--bottom-nav-clearance)]',
    ].join(' ')}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] [background:var(--gradient-page)]" />
      <h2 className="sr-only">
        {screenId} {name}
      </h2>
      <PageHeader
        title={feature}
        titleSize="page"
        leading={back ? (
          <IconButton label="뒤로" variant="ghost" size="sm" onClick={goBack}>
            <ChatIcon name="arrow-left" className="size-6 text-fg-strong" />
          </IconButton>
        ) : undefined}
      />
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-between gap-8 px-5 pb-6 pt-10">
        <section aria-labelledby="pending-review-title" className="flex flex-col items-center text-center">
          <img
            src="/brand/irumae.webp"
            alt=""
            width={104}
            height={104}
            className="block size-[104px] object-contain drop-shadow-[0_12px_20px_var(--color-primary-soft-hover)]"
          />
          <h3 id="pending-review-title" className="m-0 mt-4 text-title-1 font-extrabold tracking-irum-tight text-fg-strong">
            기숙사 인증을 확인하고 있어요
          </h3>
          <p className="m-0 mt-2 text-body text-fg-muted">인증이 끝나면 바로 {feature}을 시작할 수 있어요.</p>
          <ReviewStatus />
        </section>
        <div className="flex flex-col gap-2.5">
          <Button size="lg" fullWidth onClick={() => navigate(paths.home)}>홈으로</Button>
          <Button size="lg" variant="secondary" fullWidth onClick={() => navigate(paths.mate)}>매이트 둘러보기</Button>
        </div>
      </div>
    </main>
  );
}
