import { AppProviders } from './providers';
import { AppRouter } from './router';
import { AuthGate } from './guards';

export function App() {
  return (
    <AppProviders>
      <AuthGate>
        <AppRouter />
      </AuthGate>
    </AppProviders>
  );
}

