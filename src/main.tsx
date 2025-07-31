import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import { store } from './store';

const queryClient = new QueryClient();

// Start MSW (all environments)
import('./mocks/browser').then(({ worker }) => {
  worker.start().then(() => {
    console.log('🎭 MSW is running');

    // Render app after MSW is started
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <App />
          </Provider>
        </QueryClientProvider>
      </StrictMode>,
    );
  });
});
