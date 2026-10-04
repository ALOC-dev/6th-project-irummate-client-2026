import { createContext, useContext, useEffect, useMemo } from 'react';

import { useAuth } from '../../features/auth';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return undefined;

    // TODO: connect one socket per authenticated user.
    // Keep the connection lifecycle here so feature code only consumes events.
    return () => {
      // TODO: disconnect the socket when the user changes or leaves the app.
    };
  }, [user?.id]);

  const value = useMemo(() => ({ isConnected: false }), []);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

