import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TravelProvider } from './context/TravelContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TravelProvider>
      <App />
    </TravelProvider>
  </React.StrictMode>
);
