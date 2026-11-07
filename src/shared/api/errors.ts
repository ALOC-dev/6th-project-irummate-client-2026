import { isAxiosError } from 'axios';

export type AppErrorKind = 'network' | 'auth' | 'forbidden' | 'conflict' | 'validation' | 'server';

const DEFAULT_MESSAGES: Record<AppErrorKind, string> = {
  network: '네트워크 연결을 확인해 주세요.',
  auth: '로그인이 필요합니다.',
  forbidden: '이 기능을 사용할 권한이 없습니다.',
  conflict: '이미 처리되었거나 상태가 바뀌었습니다.',
  validation: '입력한 내용을 확인해 주세요.',
  server: '잠시 후 다시 시도해 주세요.',
};

interface AppErrorInit {
  kind: AppErrorKind;
  message?: string;
  fieldErrors?: Record<string, string>;
  code?: string;
  status?: number;
}

// 앱의 모든 통신 실패는 이 하나로 바뀌어 던져진다.
// code는 서버 오류 코드(예: SURVEY_REQUIRED, MATCH_NOT_OPEN). 같은 403이라도 화면 반응이 다르다.
export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly fieldErrors?: Record<string, string>;
  readonly code?: string;
  readonly status?: number;

  constructor(init: AppErrorInit) {
    super(init.message ?? DEFAULT_MESSAGES[init.kind]);
    this.name = 'AppError';
    this.kind = init.kind;
    if (init.fieldErrors) this.fieldErrors = init.fieldErrors;
    if (init.code) this.code = init.code;
    if (init.status !== undefined) this.status = init.status;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function kindFromStatus(status: number): AppErrorKind {
  if (status === 401) return 'auth';
  if (status === 403) return 'forbidden';
  if (status === 409) return 'conflict';
  if (status >= 400 && status < 500) return 'validation';
  return 'server';
}

interface ServerErrorBody {
  code?: unknown;
  message?: unknown;
  errors?: unknown;
}

function readFieldErrors(errors: unknown): Record<string, string> | undefined {
  if (!Array.isArray(errors)) return undefined;
  const result: Record<string, string> = {};
  for (const item of errors) {
    if (item && typeof item === 'object' && 'field' in item && 'reason' in item) {
      const { field, reason } = item as { field: unknown; reason: unknown };
      if (typeof field === 'string' && typeof reason === 'string') result[field] = reason;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (isAxiosError(error)) {
    const response = error.response;
    if (!response) return new AppError({ kind: 'network' });

    const body = (response.data ?? {}) as ServerErrorBody;
    const init: AppErrorInit = { kind: kindFromStatus(response.status), status: response.status };
    if (typeof body.message === 'string' && body.message) init.message = body.message;
    if (typeof body.code === 'string' && body.code) init.code = body.code;
    const fieldErrors = readFieldErrors(body.errors);
    if (fieldErrors) init.fieldErrors = fieldErrors;
    return new AppError(init);
  }

  return new AppError({ kind: 'server' });
}
