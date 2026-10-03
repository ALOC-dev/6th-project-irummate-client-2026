import { useAuth } from '../model/AuthContext';

export function AuthStatus() {
  const { user } = useAuth();

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
      {user ? `${user.name}님` : '로그인 전'}
    </span>
  );
}

