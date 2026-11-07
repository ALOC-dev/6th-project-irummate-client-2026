/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_TARGET?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_MSW?: string;
  readonly VITE_KAKAO_CLIENT_ID?: string;
  readonly VITE_KAKAO_REDIRECT_URI?: string;
  readonly VITE_INQUIRY_OPENCHAT_URL?: string;
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
