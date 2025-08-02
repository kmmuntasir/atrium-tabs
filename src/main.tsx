import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './components/Popup';
import './index.css';
import { sendCrashReport, sendErrorLog } from './utils/telemetry';

// Global error handling for unhandled exceptions
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Unhandled error caught by window.onerror:', { message, source, lineno, colno, error });
  sendCrashReport(new Error(message.toString()), { source, lineno, colno, type: 'onerror' });
};

// Global error handling for unhandled promise rejections
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection caught by window.onunhandledrejection:', event.reason);
  sendErrorLog(new Error(event.reason.message || 'Unhandled promise rejection'), { type: 'unhandledrejection', reason: event.reason });
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
