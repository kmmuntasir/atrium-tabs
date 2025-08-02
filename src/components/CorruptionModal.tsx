
import React, { useState, useEffect } from 'react';
import './CorruptionModal.css';
import { attemptAutoRepair } from '../utils/storage';

const CorruptionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.type === 'DATA_CORRUPTION') {
        setIsOpen(true);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleRepair = async () => {
    try {
      await attemptAutoRepair();
      setIsOpen(false);
      // Optionally, notify the user of success
    } catch (error) {
      // Optionally, notify the user of failure
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="corruption-modal-overlay">
      <div className="corruption-modal">
        <h2>Data Corruption Detected</h2>
        <p>Your saved groups appear corrupted. Export raw data, attempt auto-repair, or start fresh?</p>
        <div className="corruption-modal-actions">
          <button onClick={() => alert('Exporting raw data...')}>Export Raw Data</button>
          <button onClick={handleRepair}>Attempt Auto-Repair</button>
          <button onClick={() => chrome.storage.local.clear(() => setIsOpen(false))}>Start Fresh</button>
        </div>
      </div>
    </div>
  );
};

export default CorruptionModal;
