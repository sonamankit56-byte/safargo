import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { cleanStorageQuotaExceeded } from './lib/storageUtils';

// Clean any corrupted/over-quota items immediately on app startup
cleanStorageQuotaExceeded();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
