// 어댑터가 앱에서는 플러그인을, 웹에서는 대체 동작을 쓰는지 확인한다. 플러그인은 가짜로 바꾼다.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const plugin = vi.hoisted(() => {
  const listeners = new Map<string, Set<(event?: unknown) => void>>();
  return {
    listeners,
    platform: 'web' as 'web' | 'android' | 'ios',
    addListener(eventName: string, listener: (event?: unknown) => void) {
      const set = listeners.get(eventName) ?? new Set();
      set.add(listener);
      listeners.set(eventName, set);
      return Promise.resolve({
        remove: async () => {
          set.delete(listener);
        },
      });
    },
    emit(eventName: string, event?: unknown) {
      listeners.get(eventName)?.forEach((listener) => listener(event));
    },
  };
});

vi.mock('./isNative', () => ({
  runtime: {
    isNative: () => plugin.platform !== 'web',
    platform: () => plugin.platform,
  },
}));

vi.mock('@capacitor/app', () => ({
  App: { addListener: vi.fn(plugin.addListener), exitApp: vi.fn(async () => {}) },
}));

vi.mock('@capacitor/browser', () => ({
  Browser: { open: vi.fn(async () => {}), close: vi.fn(async () => {}) },
}));

vi.mock('@capacitor/status-bar', () => ({
  Style: { Light: 'LIGHT', Dark: 'DARK' },
  StatusBar: { setStyle: vi.fn(async () => {}), setOverlaysWebView: vi.fn(async () => {}) },
}));

vi.mock('@capacitor/keyboard', () => ({
  Keyboard: { addListener: vi.fn(plugin.addListener) },
}));

// 테스트 준비 파일(setup.ts)이 auth를 통해 진짜 어댑터를 먼저 불러 둔다.
// 모듈 기록을 비운 뒤 다시 불러야 가짜 플러그인이 연결된 어댑터를 받는다.
let App: typeof import('@capacitor/app').App;
let Browser: typeof import('@capacitor/browser').Browser;
let StatusBar: typeof import('@capacitor/status-bar').StatusBar;
let appLifecycle: typeof import('./appLifecycle').appLifecycle;
let backButton: typeof import('./backButton').backButton;
let deepLink: typeof import('./deepLink').deepLink;
let externalBrowser: typeof import('./externalBrowser').externalBrowser;
let keyboard: typeof import('./keyboard').keyboard;
let statusBar: typeof import('./statusBar').statusBar;

beforeAll(async () => {
  vi.resetModules();
  ({ App } = await import('@capacitor/app'));
  ({ Browser } = await import('@capacitor/browser'));
  ({ StatusBar } = await import('@capacitor/status-bar'));
  ({ appLifecycle } = await import('./appLifecycle'));
  ({ backButton } = await import('./backButton'));
  ({ deepLink } = await import('./deepLink'));
  ({ externalBrowser } = await import('./externalBrowser'));
  ({ keyboard } = await import('./keyboard'));
  ({ statusBar } = await import('./statusBar'));
});

// 플러그인 구독 등록(Promise)이 끝나기를 기다린다.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function listenerCount(eventName: string): number {
  return plugin.listeners.get(eventName)?.size ?? 0;
}

beforeEach(() => {
  plugin.platform = 'web';
  plugin.listeners.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('backButton', () => {
  it('Android에서 버튼 이벤트를 처리 함수로 전달하고, 해제하면 구독을 지운다', async () => {
    plugin.platform = 'android';
    const handler = vi.fn();
    const unsubscribe = backButton.subscribe(handler);
    await flush();

    plugin.emit('backButton', { canGoBack: true });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    await flush();
    expect(listenerCount('backButton')).toBe(0);
  });

  it('처리 함수는 하나만 남는다(새로 등록하면 이전 것을 해제)', async () => {
    plugin.platform = 'android';
    const first = vi.fn();
    const second = vi.fn();
    backButton.subscribe(first);
    await flush();
    const unsubscribe = backButton.subscribe(second);
    await flush();

    plugin.emit('backButton');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(listenerCount('backButton')).toBe(1);
    unsubscribe();
  });

  it('등록이 끝나기 전에 해제해도 구독이 남지 않는다', async () => {
    plugin.platform = 'android';
    const unsubscribe = backButton.subscribe(vi.fn());
    unsubscribe();
    await flush();
    expect(listenerCount('backButton')).toBe(0);
  });

  it.each(['ios', 'web'] as const)('%s에서는 구독하지 않고 종료도 하지 않는다', async (platform) => {
    plugin.platform = platform;
    backButton.subscribe(vi.fn());
    await backButton.exitApp();
    expect(App.addListener).not.toHaveBeenCalled();
    expect(App.exitApp).not.toHaveBeenCalled();
  });

  it('Android에서 exitApp은 앱을 종료한다', async () => {
    plugin.platform = 'android';
    await backButton.exitApp();
    expect(App.exitApp).toHaveBeenCalledTimes(1);
  });
});

describe('appLifecycle', () => {
  it('앱에서는 resume·pause 이벤트를 쓴다', async () => {
    plugin.platform = 'ios';
    const onResume = vi.fn();
    const onPause = vi.fn();
    const offResume = appLifecycle.onResume(onResume);
    const offPause = appLifecycle.onPause(onPause);
    await flush();

    plugin.emit('resume');
    plugin.emit('pause');
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onPause).toHaveBeenCalledTimes(1);

    offResume();
    offPause();
    await flush();
    expect(listenerCount('resume') + listenerCount('pause')).toBe(0);
  });

  it('웹에서는 화면 표시 상태 변경을 쓴다', () => {
    const onResume = vi.fn();
    const off = appLifecycle.onResume(onResume);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(App.addListener).not.toHaveBeenCalled();
    off();
  });
});

describe('deepLink', () => {
  it('앱에서는 앱을 연 주소를 전달한다', async () => {
    plugin.platform = 'android';
    const handler = vi.fn();
    const off = deepLink.onOpen(handler);
    await flush();

    plugin.emit('appUrlOpen', { url: 'https://test.irummate.com/oauth/kakao/callback?code=x' });
    expect(handler).toHaveBeenCalledWith('https://test.irummate.com/oauth/kakao/callback?code=x');
    off();
  });

  it('웹에서는 구독하지 않는다', () => {
    deepLink.onOpen(vi.fn());
    expect(App.addListener).not.toHaveBeenCalled();
  });
});

describe('externalBrowser', () => {
  it('앱에서는 앱 안 브라우저로 연다', async () => {
    plugin.platform = 'android';
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    await externalBrowser.open('https://kauth.kakao.com/oauth/authorize');
    expect(windowOpen).not.toHaveBeenCalled();
    expect(Browser.open).toHaveBeenCalledWith({ url: 'https://kauth.kakao.com/oauth/authorize' });
  });

  it('웹에서는 opener 없이 새 탭으로 연다', async () => {
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    await externalBrowser.open('https://example.com');
    expect(windowOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    expect(Browser.open).not.toHaveBeenCalled();
  });

  it.each(['javascript:alert(1)', 'intent://x', 'relative/path'])(
    'http·https가 아닌 주소(%s)는 열지 않는다',
    async (url) => {
      plugin.platform = 'android';
      await expect(externalBrowser.open(url)).rejects.toThrow();
      expect(Browser.open).not.toHaveBeenCalled();
    },
  );

  it('앱에서 close는 열린 창이 없어 실패해도 오류를 내지 않는다', async () => {
    plugin.platform = 'ios';
    vi.mocked(Browser.close).mockRejectedValueOnce(new Error('no browser'));
    await expect(externalBrowser.close()).resolves.toBeUndefined();
  });

  it('웹에서 close는 아무것도 하지 않는다', async () => {
    await externalBrowser.close();
    expect(Browser.close).not.toHaveBeenCalled();
  });
});

describe('statusBar', () => {
  it.each([
    ['light', 'LIGHT'],
    ['dark', 'DARK'],
  ] as const)('앱에서 %s 배경은 플러그인 스타일 %s로 바꾼다', async (style, expected) => {
    plugin.platform = 'ios';
    await statusBar.configure({ style });
    expect(StatusBar.setStyle).toHaveBeenCalledWith({ style: expected });
    expect(StatusBar.setOverlaysWebView).not.toHaveBeenCalled();
  });

  it('겹침 설정을 받지 않는 기기(Android 15 이상)에서도 오류를 내지 않는다', async () => {
    plugin.platform = 'android';
    vi.mocked(StatusBar.setOverlaysWebView).mockRejectedValueOnce(new Error('not available'));
    await expect(statusBar.configure({ style: 'light', overlay: true })).resolves.toBeUndefined();
  });

  it('웹에서는 아무것도 하지 않는다', async () => {
    await statusBar.configure({ style: 'dark', overlay: true });
    expect(StatusBar.setStyle).not.toHaveBeenCalled();
  });
});

describe('keyboard', () => {
  it('앱에서는 열림·닫힘과 높이를 전달하고, 해제하면 두 구독을 모두 지운다', async () => {
    plugin.platform = 'android';
    const handler = vi.fn();
    const off = keyboard.onChange(handler);
    await flush();

    plugin.emit('keyboardWillShow', { keyboardHeight: 300 });
    plugin.emit('keyboardWillHide');
    expect(handler).toHaveBeenNthCalledWith(1, { open: true, height: 300 });
    expect(handler).toHaveBeenNthCalledWith(2, { open: false, height: 0 });

    off();
    await flush();
    expect(listenerCount('keyboardWillShow') + listenerCount('keyboardWillHide')).toBe(0);
  });
});
