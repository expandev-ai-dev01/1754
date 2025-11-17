import { Toaster } from '@/core/components/ui/sonner';
import { AppProviders } from './providers';
import { AppRouter } from './router';

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster />
    </AppProviders>
  );
}

export default App;
