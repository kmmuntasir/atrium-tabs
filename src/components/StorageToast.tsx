
import React, { useState, useEffect } from 'react';
import './StorageToast.css';

interface ToastMessage {
  message: string;
  level: 'medium' | 'high' | 'critical';
}

const StorageToast: React.FC = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.type === 'STORAGE_WARNING') {
        setToast(request.payload);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div className={`storage-toast storage-toast-${toast.level}`}>
      <p>{toast.message}</p>
      <button onClick={() => setToast(null)}>Close</button>
    </div>
  );
};

export default StorageToast;
