import React, { useState, useEffect } from 'react';
import './Settings.css';
import { Flex, RadioGroup, Text, Switch, Tabs, Button, Link, Dialog } from '@radix-ui/themes';
import WelcomeTour from './WelcomeTour';
import { getAllData, saveData } from '../utils/storage';
import toast from 'react-hot-toast';

interface SettingsProps {
  initialActiveTab?: string;
}

interface Command {
  name: string;
  description: string;
  shortcut: string;
}

const Settings: React.FC<SettingsProps> = ({ initialActiveTab = 'general' }) => {
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const [theme, setTheme] = useState('system');
  const [includePinnedTabs, setIncludePinnedTabs] = useState(false);
  const [eagerLoad, setEagerLoad] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [commands, setCommands] = useState<chrome.commands.Command[]>([]);
  const [showQuotaExceededModal, setShowQuotaExceededModal] = useState(false);
  const [telemetryOptIn, setTelemetryOptIn] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chrome.commands) {
      chrome.commands.getAll((cmds) => {
        setCommands(cmds);
      });
    }
    // Load preferences from storage
    chrome.storage.local.get([
      'atrium_theme',
      'atrium_sort_order',
      'atrium_include_pinned_tabs',
      'telemetry_opt_in',
      'atrium_high_contrast',
      'has_run_before',
    ], (items) => {
      if (items.atrium_theme) setTheme(items.atrium_theme);
      if (items.atrium_sort_order) setSortOrder(items.atrium_sort_order);
      if (typeof items.atrium_include_pinned_tabs === 'boolean') setIncludePinnedTabs(items.atrium_include_pinned_tabs);
      if (typeof items.telemetry_opt_in === 'boolean') setTelemetryOptIn(items.telemetry_opt_in);
      if (typeof items.atrium_high_contrast === 'boolean') setHighContrast(items.atrium_high_contrast);

      // Set active tab to welcome-tour if it's the first run
      if (!items.has_run_before) {
        setActiveTab('welcome-tour');
        chrome.storage.local.set({ has_run_before: true });
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ atrium_theme: theme });
  }, [theme]);

  useEffect(() => {
    chrome.storage.local.set({ atrium_sort_order: sortOrder });
  }, [sortOrder]);

  useEffect(() => {
    chrome.storage.local.set({ atrium_include_pinned_tabs: includePinnedTabs });
  }, [includePinnedTabs]);

  useEffect(() => {
    chrome.storage.local.set({ telemetry_opt_in: telemetryOptIn });
  }, [telemetryOptIn]);

  useEffect(() => {
    chrome.storage.local.set({ atrium_high_contrast: highContrast });
    // Apply/remove a class to the body or root element to trigger CSS changes
    if (highContrast && theme === 'light') {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [highContrast, theme]);

  const handleTourComplete = () => {
    setActiveTab('general');
  };

  const handleExportData = async () => {
    try {
      const allData = await getAllData();
      // If getAllData returns an error object, handle it (instanceof Error or plain object with message)
      if (
        allData instanceof Error ||
        (allData && typeof allData === 'object' && 'message' in allData)
      ) {
        throw allData;
      }
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
            <Text size="2" mb="2">High Contrast Theme (Light Mode Only):</Text>
            <Flex gap="2" align="center">
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              <Text size="2">{highContrast ? 'Enabled' : 'Disabled'}</Text>
            </Flex>
          </Flex>

          <Flex direction="column" gap="3" mt="5">
            <Text size="2" mb="2">Telemetry & Analytics (Opt-in):</Text>
            <Flex gap="2" align="center">
              <Switch checked={telemetryOptIn} onCheckedChange={setTelemetryOptIn} />
              <Text size="2">{telemetryOptIn ? 'Enabled' : 'Disabled'}</Text>
            </Flex>
            <Text size="1" color="gray">
              Help us improve by sending anonymous usage data (e.g., total groups/tabs, crash reports).
            </Text>
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
          <WelcomeTour onTourComplete={handleTourComplete} />
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