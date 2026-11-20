// @vitest-environment node
// 발급받은 업로드 주소로 보내는 요청의 헤더·본문, 실패 변환, 시간 제한을 MSW로 확인한다.
// Node 환경에서 돌린다: jsdom의 Blob·File은 MSW가 본문으로 읽지 못해 "[object Blob]" 글자로 바뀐다
// (axios 없이 XMLHttpRequest·fetch로 보내도 같음). 실제 브라우저·WebView와는 무관한 테스트 환경 한계다.
import { delay, http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@test/msw/server';

import { registerAuthHandlers } from './client';
import { isAppError } from './errors';
import { uploadTimeoutMs, uploadToPresignedUrl } from './presignedUpload';

const UPLOAD_PATH = 'https://bucket.s3.example.com/certifications/a.png';
const UPLOAD_URL = `${UPLOAD_PATH}?X-Amz-Signature=abc`;

interface Captured {
  method: string;
  headers: Headers;
  body: ArrayBuffer;
}

function captureUpload(captured: Captured[], response: () => Response = () => new HttpResponse(null, { status: 200 })) {
  return http.put(UPLOAD_PATH, async ({ request }) => {
    captured.push({ method: request.method, headers: request.headers, body: await request.arrayBuffer() });
    return response();
  });
}

function pngFile(bytes: BlobPart[] = ['png-bytes']): File {
  return new File(bytes, 'a.png', { type: 'image/png' });
}

async function catchError(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    if (isAppError(error)) return error;
    throw error;
  }
  throw new Error('오류가 나야 하는데 성공했다');
}

beforeEach(() => {
  // 인증 토큰이 있어도 업로드 요청에는 실리지 않아야 한다.
  registerAuthHandlers({
    getAccessToken: () => 'access-token',
    setAccessToken: () => {},
    clearAccessToken: () => {},
    onAuthExpired: () => {},
    onTokenRefreshed: () => {},
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('uploadToPresignedUrl', () => {
  it('Content-Type과 If-None-Match만 싣고 인증 헤더는 싣지 않는다', async () => {
    const captured: Captured[] = [];
    server.use(captureUpload(captured));

    await uploadToPresignedUrl(UPLOAD_URL, pngFile(), 'image/png');

    expect(captured).toHaveLength(1);
    const [request] = captured;
    expect(request?.method).toBe('PUT');
    expect(request?.headers.get('Content-Type')).toBe('image/png');
    expect(request?.headers.get('If-None-Match')).toBe('*');
    expect(request?.headers.get('Authorization')).toBeNull();
  });

  it('파일 내용을 그대로 본문으로 보낸다', async () => {
    const captured: Captured[] = [];
    server.use(captureUpload(captured));
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    await uploadToPresignedUrl(UPLOAD_URL, pngFile([bytes]), 'image/png');

    expect(new Uint8Array(captured[0]?.body ?? new ArrayBuffer(0))).toEqual(bytes);
  });

  it('저장소가 403(XML 본문)을 주면 권한 오류로 바꿔 던진다', async () => {
    server.use(
      captureUpload([], () => HttpResponse.xml('<Error><Code>SignatureDoesNotMatch</Code></Error>', { status: 403 })),
    );

    const error = await catchError(uploadToPresignedUrl(UPLOAD_URL, pngFile(), 'image/png'));

    expect(error.kind).toBe('forbidden');
    expect(error.status).toBe(403);
  });

  it('네트워크 오류면 네트워크 오류로 바꿔 던진다', async () => {
    server.use(http.put(UPLOAD_PATH, () => HttpResponse.error()));

    const error = await catchError(uploadToPresignedUrl(UPLOAD_URL, pngFile(), 'image/png'));

    expect(error.kind).toBe('network');
  });

  it('응답이 오지 않으면 시간 제한이 지난 뒤 네트워크 오류로 끝난다', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    server.use(
      http.put(UPLOAD_PATH, async () => {
        await delay('infinite');
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const pending = catchError(uploadToPresignedUrl(UPLOAD_URL, pngFile(), 'image/png'));
    await vi.advanceTimersByTimeAsync(uploadTimeoutMs(pngFile().size));
    const error = await pending;

    expect(error.kind).toBe('network');
  });
});

describe('uploadTimeoutMs', () => {
  it.each([
    [0, 15_000],
    [19_066, 15_000],
    [750_000, 15_000],
    [1_000_000, 20_000],
    [5 * 1024 * 1024, 104_858],
  ])('%i바이트 → %i밀리초', (size, expected) => {
    expect(uploadTimeoutMs(size)).toBe(expected);
  });
});
