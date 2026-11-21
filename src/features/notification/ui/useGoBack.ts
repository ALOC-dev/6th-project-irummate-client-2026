import { useNavigate } from 'react-router';

/** 앱 안에서 들어왔으면 이전 화면으로, 바로 열었으면 fallback으로 간다. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  return () => {
    const routerIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (routerIndex > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}
