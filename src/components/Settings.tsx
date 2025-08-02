import React, { useState, useEffect } from 'react';
import './Settings.css';
import { Flex, RadioGroup, Text, Switch, Tabs, Button, Link, Dialog } from '@radix-ui/themes';
import WelcomeTour from './WelcomeTour';
import { getAllData, saveData } from '../utils/storage';
import toast from 'react-hot-toast';

interface Command {
  name: string;
  description: string;
  shortcut: string;
}

const Settings: React.FC = () => {
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const [theme, setTheme] = useState('system');
  const [includePinnedTabs, setIncludePinnedTabs] = useState(false);
  const [eagerLoad, setEagerLoad] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [commands, setCommands] = useState<chrome.commands.Command[]>([]);
  const [showQuotaExceededModal, setShowQuotaExceededModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chrome.commands) {
      chrome.commands.getAll((cmds) => {
        setCommands(cmds);
      });
    }
  }, []);

  const handleSkipTour = () => {
    setActiveTab('general');
  };

  const handleFinishTour = () => {
    setActiveTab('general');
    // Optionally, perform other actions on finish, e.g., show a toast from WelcomeTour
  };

  const handleExportData = async () => {
    try {
      const allData = await getAllData();
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'atrium-tabs-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data.');
    }
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedData = JSON.parse(result);
          // For now, directly save. Later, add logic for merging/overwriting with UUIDs and name collision.
          await saveData(importedData);
          toast.success('Data imported successfully!');
        }
      } catch (error: any) {
        console.error('Error importing data:', error);
        if (error.message === 'STORAGE_QUOTA_EXCEEDED') {
          setShowQuotaExceededModal(true);
        } else {
          toast.error('Failed to import data or invalid JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="welcome-tour">Welcome/Quick Tour</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general">
          <Flex direction="column" gap="3">
            <Text size="2" mb="2">Group Sort Order:</Text>
            <RadioGroup.Root defaultValue="alphabetical" onValueChange={setSortOrder}>
              <Flex gap="2" direction="column">
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="alphabetical" /> Alphabetical
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="lastUsage" /> Last Usage
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="manual" /> Manual (Drag & Drop)
                  </Flex>
                </Text>
              </Flex>
            </RadioGroup.Root>
          </Flex>

          <Flex direction="column" gap="3" mt="5">
            <Text size="2" mb="2">Theme:</Text>
            <RadioGroup.Root defaultValue="system" onValueChange={setTheme}>
              <Flex gap="2" direction="column">
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="light" /> Light
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="dark" /> Dark
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="system" /> System
                  </Flex>
                </Text>
              </Flex>
            </RadioGroup.Root>
          </Flex>

          <Flex direction="column" gap="3" mt="5">
            <Text size="2" mb="2">Include Pinned Tabs in Groups:</Text>
            <Flex gap="2" align="center">
              <Switch checked={includePinnedTabs} onCheckedChange={setIncludePinnedTabs} />
              <Text size="2">{includePinnedTabs ? 'Yes' : 'No'}</Text>
            </Flex>
          </Flex>

          <Flex direction="column" gap="3" mt="5">
            <Text size="2" mb="2">Eager Load:</Text>
            <Flex gap="2" align="center">
              <Switch checked={eagerLoad} onCheckedChange={setEagerLoad} />
              <Text size="2">{eagerLoad ? 'Enabled' : 'Disabled'}</Text>
            </Flex>
            {eagerLoad && (
              <Text size="1" color="red">
                Heads-up: eager loading can hammer RAM/CPU on large groups.
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="3" mt="5">
            <Text size="2" mb="2">Import/Export:</Text>
            <Flex gap="2">
              <Button onClick={handleExportData}>Export Data</Button>
              <Button onClick={handleImportData}>Import Data</Button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Flex>
          </Flex>

          <Flex direction="column" gap="3" mt="5">
            <Text size="2" mb="2">Hotkey Mapping:</Text>
            {commands.length > 0 ? (
              <Flex direction="column" gap="2">
                {commands.map((cmd) => (
                  <Text size="2" key={cmd.name}>
                    <strong>{cmd.description || cmd.name}:</strong> {cmd.shortcut || 'Not set'}
                  </Text>
                ))}
                <Text size="1" color="gray">
                  To change hotkeys, visit:
                  <Link href="chrome://extensions/shortcuts" target="_blank" rel="noopener noreferrer">
                    chrome://extensions/shortcuts
                  </Link>
                </Text>
              </Flex>
            ) : (
              <Text size="2">No hotkeys found or commands API not available.</Text>
            )}
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="welcome-tour">
          <WelcomeTour onSkip={handleSkipTour} onFinish={handleFinishTour} />
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root open={showQuotaExceededModal} onOpenChange={setShowQuotaExceededModal}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Storage Full</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Your storage is full. Please export your data or delete some groups before continuing.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
            <Button variant="flat" onClick={handleExportData}>
              Export Data
            </Button>
            {/* Future: Add button to navigate to group management page to delete groups */}
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default Settings;