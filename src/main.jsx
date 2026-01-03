console.log('Main.jsx executing...');
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './i18n';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    // console.log('App updated. Refresh to see new version.');
  },
  onOfflineReady() {
    // console.log('App ready to work offline');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
