// 서버가 발급한 업로드 주소(S3 presigned URL)로 파일을 직접 올린다.
// 인증 헤더를 붙이면 저장소의 서명 검증이 깨지므로, 인터셉터·baseURL이 없는 별도 클라이언트를 쓴다.
// 발급 API 호출과 파일 형식 검사는 도메인 규칙이라 각 feature에 둔다.
import axios from 'axios';

import { AppError, toAppError } from './errors';

const uploadClient = axios.create();

// 느린 망(상향 약 50KB/s)에서도 끊기지 않게 파일 크기에 비례해 기다리고, 작은 파일은 최소 15초로 둔다.
// 예: 19KB → 15초, 1MB → 20초, 5MB(서버 상한) → 약 105초.
const MIN_TIMEOUT_MS = 15_000;
const MIN_BYTES_PER_SECOND = 50_000;

export function uploadTimeoutMs(sizeInBytes: number): number {
  return Math.max(MIN_TIMEOUT_MS, Math.ceil((sizeInBytes / MIN_BYTES_PER_SECOND) * 1000));
}

// 서버는 업로드 주소에 Content-Type과 덮어쓰기 금지 조건(If-None-Match: *)을 함께 서명한다
// (Android 실기기에서 서명 헤더 content-type;host;if-none-match 확인, If-None-Match를 빼면 403).
// 그래서 두 헤더를 항상 같은 값으로 싣는다.
//
// file은 Blob이 아니라 File이어야 한다. 앱의 네이티브 HTTP는 File만 base64로 바꿔 넘기고,
// 일반 Blob은 올바르게 보내지 못한다.
// 앱에서 파일 읽기가 실패하면 네이티브 HTTP의 XHR 경로가 끝나지 않으므로, 직접 시간 제한을 둔다
// (axios의 timeout은 네이티브 HTTP가 가로챈 XHR에서는 동작하지 않는다).
export async function uploadToPresignedUrl(uploadUrl: string, file: File, contentType: string): Promise<void> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AppError({ kind: 'network' }));
    }, uploadTimeoutMs(file.size));
  });

  const upload = uploadClient
    .put(uploadUrl, file, {
      headers: { 'Content-Type': contentType, 'If-None-Match': '*' },
      signal: controller.signal,
    })
    .then(() => undefined);

  try {
    await Promise.race([upload, timeout]);
  } catch (error) {
    throw toAppError(error);
  } finally {
    clearTimeout(timer);
  }
}
