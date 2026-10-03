import { useAuth } from '../../features/auth';

export function AuthGate({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">불러오는 중...</div>;
  }

  return children;
}

