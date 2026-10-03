import { useAuth } from '../model/AuthContext';

export function useSession() {
  return useAuth();
}

