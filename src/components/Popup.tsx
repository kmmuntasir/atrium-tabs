import React, { useEffect, useState } from 'react';
import GroupList from './GroupList';
import toast from 'react-hot-toast';
import { Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { getStorageUsage, checkDataIntegrity, getAllData, attemptAutoRepair } from '../utils/storage';

export default function Popup() {
  const [showCorruptionModal, setShowCorruptionModal] = useState(false);
  const [showStorageFullModal, setShowStorageFullModal] = useState(false);
  const [storageFullMessage, setStorageFullMessage] = useState('');
  const openSettingsPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  };

  const handleExportRawData = async () => {
    try {
      const allData = await getAllData();
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atrium-tabs-corrupted-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Raw data exported successfully!');
      setShowCorruptionModal(false);
    } catch (error) {
      console.error('Error exporting raw data:', error);
      toast.error('Failed to export raw data.');
    }
  };

  const handleAutoRepair = async () => {
    try {
      await attemptAutoRepair();
      toast.success('Auto-repair attempted. Reloading extension...');
      chrome.runtime.reload();
    } catch (error) {
      console.error('Error during auto-repair:', error);
      toast.error('Auto-repair failed.');
    }
  };

  const handleStartFresh = () => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.error("Error clearing storage:", chrome.runtime.lastError);
        toast.error("Failed to clear storage.");
      } else {
        toast.success("Storage cleared. Starting fresh!");
        chrome.runtime.reload();
      }
    });
  };

  useEffect(() => {
    const runInitialChecks = async () => {
      // Check data integrity first
      const isDataIntact = await checkDataIntegrity();
      if (!isDataIntact) {
        setShowCorruptionModal(true);
        return; // Stop further checks if data is corrupted
      }

      // Then check storage usage
      if (chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse && chrome.storage.local.QUOTA_BYTES) {
        const { bytesInUse, quotaBytes } = await getStorageUsage();
        const usagePercentage = (bytesInUse / quotaBytes) * 100;

        if (usagePercentage >= 90) {
          toast.error('Storage nearly full: 90% capacity. Export or delete data.', { id: 'storage-warning', duration: Infinity });
        } else if (usagePercentage >= 80) {
          toast.warn('Storage getting full: 80% capacity.', { id: 'storage-warning', duration: Infinity });
        } else if (usagePercentage >= 50) {
          toast.success('Storage at 50% capacity.', { id: 'storage-warning', duration: Infinity });
        } else {
          toast.dismiss('storage-warning');
        }
      }
    };
    runInitialChecks();

    const handleMessages = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.type === 'STORAGE_WARNING') {
        const { message: msg, level } = message.payload;
        if (level === 'critical') {
          toast.error(msg, { id: 'storage-warning', duration: Infinity });
        } else if (level === 'high') {
          toast.warn(msg, { id: 'storage-warning', duration: Infinity });
        } else if (level === 'medium') {
          toast.success(msg, { id: 'storage-warning', duration: Infinity });
        }
      } else if (message.type === 'STORAGE_FULL') {
        setStorageFullMessage(message.payload.message);
        setShowStorageFullModal(true);
      }
      sendResponse(); // Acknowledge message receipt
    };

    chrome.runtime.onMessage.addListener(handleMessages);

    // Clean up the listener when the component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  return (
    <div style={{ width: 320, padding: 16 }}>
      <h2>Atrium Tabs</h2>
      <Button onClick={openSettingsPage}>Open Settings</Button>
      <Button onClick={() => toast.success('Hello from Atrium Tabs!')}>Show Toast</Button>
      <GroupList />

      <Dialog.Root open={showCorruptionModal} onOpenChange={setShowCorruptionModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Data Corruption Detected</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Your saved groups appear corrupted. What would you like to do?
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={handleExportRawData}>
              Export Raw Data
            </Button>
            <Button variant="outline" onClick={handleAutoRepair}>
              Attempt Auto-Repair
            </Button>
            <Button variant="destructive" onClick={handleStartFresh}>
              Start Fresh
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={showStorageFullModal} onOpenChange={setShowStorageFullModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Storage Full</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            {storageFullMessage}
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={openSettingsPage}>
              Go to Settings (to Export/Delete)
            </Button>
            <Button variant="outline" onClick={() => setShowStorageFullModal(false)}>
              Close
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}