import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { App } from './App';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './theme/ThemeContext';

// Apply the saved (or system-preferred) theme synchronously, before React mounts,
// so we never flash light-mode while booting.
(function applyInitialTheme() {
  try {
    const stored = window.localStorage.getItem('deharri.theme');
    const isDark =
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch { /* localStorage unavailable — fall through to default light. */ }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
