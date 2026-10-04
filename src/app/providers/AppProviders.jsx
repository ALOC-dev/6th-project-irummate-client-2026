import { AuthProvider } from '../../features/auth';
import { SocketProvider } from '../socket';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  );
}

