import type { PluginListenerHandle } from '@capacitor/core';

import type { Unsubscribe } from './types';

// 플러그인 구독은 등록이 비동기라 해제 손잡이가 늦게 온다. 그 전에 해제하면 손잡이가 오는 즉시 지운다.
export function fromPluginListener(registration: Promise<PluginListenerHandle>): Unsubscribe {
  let removed = false;
  let handle: PluginListenerHandle | undefined;
  registration
    .then((received) => {
      if (removed) void received.remove();
      else handle = received;
    })
    .catch(() => {});
  return () => {
    if (removed) return;
    removed = true;
    void handle?.remove();
  };
}
