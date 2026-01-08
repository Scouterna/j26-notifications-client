import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { applyRuntimeConfig } from './config';

async function bootstrap() {
  try {
    const response = await fetch('config/config.json', { cache: 'no-store' });
    if (response.ok) {
      const runtimeConfig = await response.json();
      window.__APP_CONFIG__ = runtimeConfig;
      applyRuntimeConfig(runtimeConfig);
    }
  } catch (error) {
    console.warn('Failed to load runtime config', error);
  } finally {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

bootstrap();
