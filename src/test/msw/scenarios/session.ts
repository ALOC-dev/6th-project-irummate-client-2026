// 세션 시나리오 4종. 개발 서버 주소의 ?session=anonymous|onboarding|pending|certified로 고른다.
// onboarding은 &stage=terms|intro|profile|certification으로 세부 단계를 고른다(기본 terms).
// pending은 인증 심사 중이다(매칭·채팅의 심사 중 안내 확인용).
// 아무것도 붙이지 않으면 certified라 uukdo는 평소 그대로 개발하면 된다. 관리자(admin)는 나중에 더한다.
// 서버 값은 handlers/auth.ts가 만들고, 서버가 모르는 소개 완료 표시는 여기서 채운다.
import { introProgress } from '@features/auth';

import { mswUserId } from '../fixtures/session';

export type OnboardingStep = 'terms' | 'intro' | 'profile' | 'certification';

export type SessionScenario =
  | { session: 'anonymous' }
  | { session: 'onboarding'; stage: OnboardingStep }
  | { session: 'pending' }
  | { session: 'certified' };

const STORAGE_KEY = 'msw.session';
const DEFAULT_SCENARIO: SessionScenario = { session: 'certified' };
const STEPS: readonly OnboardingStep[] = ['terms', 'intro', 'profile', 'certification'];

let current: SessionScenario | null = null;

function parse(session: string | null, stage: string | null): SessionScenario | null {
  if (session === 'anonymous' || session === 'pending' || session === 'certified') return { session };
  if (session === 'onboarding') return { session, stage: STEPS.find((s) => s === stage) ?? 'terms' };
  return null;
}

function readStored(): SessionScenario | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as { session?: string; stage?: string };
    return parse(value.session ?? null, value.stage ?? null);
  } catch {
    return null;
  }
}

// 주소에 시나리오가 있으면 기억해 두어 화면을 옮기거나 새로고침해도 유지한다(토큰이 아닌 개발용 값).
export function readScenarioFromUrl(search: string = window.location.search): SessionScenario {
  const params = new URLSearchParams(search);
  const fromUrl = parse(params.get('session'), params.get('stage'));
  if (fromUrl) setSessionScenario(fromUrl);
  return getSessionScenario();
}

export function getSessionScenario(): SessionScenario {
  return current ?? readStored() ?? DEFAULT_SCENARIO;
}

// 소개 다음 단계(profile·certification)와 심사 중은 소개를 본 사용자다.
function applyIntroProgress(scenario: SessionScenario | null): void {
  const introDone =
    scenario?.session === 'pending' ||
    (scenario?.session === 'onboarding' && (scenario.stage === 'profile' || scenario.stage === 'certification'));
  if (introDone) introProgress.markCompleted(mswUserId);
  else introProgress.clear(mswUserId);
}

export function setSessionScenario(scenario: SessionScenario): void {
  current = scenario;
  applyIntroProgress(scenario);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
  } catch {
    // 저장소를 쓸 수 없으면 이번 실행 동안만 기억한다.
  }
}

export function resetSessionScenario(): void {
  current = null;
  applyIntroProgress(null);
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다.
  }
}
