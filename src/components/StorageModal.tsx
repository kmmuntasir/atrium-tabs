
import React, { useState, useEffect } from 'react';
import './StorageModal.css';

const StorageModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.type === 'STORAGE_FULL') {
        setIsOpen(true);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="storage-modal-overlay">
      <div className="storage-modal">
        <h2>Storage Full</h2>
        <p>Storage is full. Export or delete some groups before continuing.</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </div>
    </div>
  );
};

export default StorageModal;
