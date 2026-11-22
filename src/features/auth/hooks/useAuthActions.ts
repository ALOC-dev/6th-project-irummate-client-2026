import { useContext } from 'react';

import { AuthActionsContext, type AuthActions } from '../model/AuthContext';

// feature 안에서만 쓴다(index.ts로 공개하지 않음).
export function useAuthActions(): AuthActions {
  const actions = useContext(AuthActionsContext);
  if (!actions) throw new Error('인증 동작은 AuthProvider 안에서만 쓸 수 있습니다.');
  return actions;
}
