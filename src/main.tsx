import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App.tsx';
import './index.css';

// Start MSW (all environments)
import('./mocks/browser').then(({ worker }) => {
  worker.start().then(() => {
    console.log('🎭 MSW is running');

    // Render app after MSW is started
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </StrictMode>,
    );
  });
});
