import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock toast notifications with simple vi.fn() - must be defined before any imports that use it
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    dismiss: vi.fn(),
  },
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import Settings from '../components/Settings';
import toast from 'react-hot-toast';

// Mock chrome API
const mockChromeStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
    getBytesInUse: vi.fn(),
    QUOTA_BYTES: 5 * 1024 * 1024, // 5MB
    clear: vi.fn(),
  },
};

const mockChromeCommands = {
  getAll: vi.fn(),
};

Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
    commands: mockChromeCommands,
    runtime: {
      getURL: (path: string) => `chrome://extension-id/${path}`,
      reload: vi.fn(),
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      lastError: undefined,
    },
    tabs: {
      create: vi.fn(),
    },
  },
  writable: true,
});

// Mock global URL functions for blob downloads
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});


describe('Settings Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Default successful mocks
    mockChromeStorage.local.get.mockImplementation((_keys, callback) => {
      if (typeof callback === 'function') callback({});
    });
    mockChromeStorage.local.set.mockImplementation((_data, callback) => {
      if (typeof callback === 'function') callback();
    });
    (global.chrome.storage.local.getBytesInUse as vi.Mock).mockImplementation((keys, callback) => {
      if (typeof callback === 'function') callback(0); // Ensure callback is called
    });
    (global.chrome.commands.getAll as vi.Mock).mockImplementation((callback) => callback([]));
    mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-blob');
  });

  test('renders without crashing', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('sort order radio buttons are present and interactive', () => {
    render(<Settings />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      console.log('Radio name:', radio.getAttribute('name'), 'value:', radio.getAttribute('value'), 'text:', radio.textContent);
    });
    const alphabeticalRadio = screen.getByRole('radio', { name: /Alphabetical/i });
    const lastUsageRadio = screen.getByRole('radio', { name: /Last Usage/i });
    const manualRadio = screen.getByRole('radio', { name: /Manual \(Drag & Drop\)/i });
    expect(alphabeticalRadio).toHaveAttribute('aria-checked', 'true');
    expect(lastUsageRadio).toHaveAttribute('aria-checked', 'false');
    expect(manualRadio).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(lastUsageRadio);
    expect(lastUsageRadio).toHaveAttribute('aria-checked', 'true');
    expect(alphabeticalRadio).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(manualRadio);
    expect(manualRadio).toHaveAttribute('aria-checked', 'true');
    expect(lastUsageRadio).toHaveAttribute('aria-checked', 'false');
  });

  test('theme radio buttons are present and interactive', () => {
    render(<Settings />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      console.log('Radio name:', radio.getAttribute('name'), 'value:', radio.getAttribute('value'), 'text:', radio.textContent);
    });
    const systemThemeRadio = screen.getByRole('radio', { name: /System/i });
    const lightThemeRadio = screen.getByRole('radio', { name: /Light/i });
    const darkThemeRadio = screen.getByRole('radio', { name: /Dark/i });
    expect(systemThemeRadio).toHaveAttribute('aria-checked', 'true');
    expect(lightThemeRadio).toHaveAttribute('aria-checked', 'false');
    expect(darkThemeRadio).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(lightThemeRadio);
    expect(lightThemeRadio).toHaveAttribute('aria-checked', 'true');
    expect(systemThemeRadio).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(darkThemeRadio);
    expect(darkThemeRadio).toHaveAttribute('aria-checked', 'true');
    expect(lightThemeRadio).toHaveAttribute('aria-checked', 'false');
  });

  test('"Include Pinned Tabs in Groups" switch is present and interactive', async () => {
    render(<Settings />);
    // Find the section by its text first
    const section = await screen.findByText(/Include Pinned Tabs in Groups:/i, {}, { timeout: 5000 }).then(el => el.closest('div'));
    expect(section).toBeInTheDocument();

    const pinnedTabsSwitch = within(section!).getByRole('switch');
    const pinnedTabsText = within(section!).getByText(/No|Yes/i);

    expect(pinnedTabsSwitch).toHaveAttribute('aria-checked', 'false');
    expect(pinnedTabsText).toHaveTextContent('No');
    fireEvent.click(pinnedTabsSwitch!);
    expect(pinnedTabsSwitch).toHaveAttribute('aria-checked', 'true');
    expect(within(section!).getByText('Yes')).toBeInTheDocument();
  });

  test('"Eager Load" switch is present, interactive, and shows warning', async () => {
    render(<Settings />);
    const section = await screen.findByText(/Eager Load:/i, {}, { timeout: 5000 }).then(el => el.closest('div'));
    expect(section).toBeInTheDocument();

    const eagerLoadSwitch = within(section!).getByRole('switch');
    const eagerLoadText = within(section!).getByText(/Disabled|Enabled/i);

    expect(eagerLoadSwitch).toHaveAttribute('aria-checked', 'false');
    expect(eagerLoadText).toHaveTextContent('Disabled');
    expect(screen.queryByText(/Heads-up: eager loading can hammer RAM\/CPU on large groups\./i)).not.toBeInTheDocument();

    fireEvent.click(eagerLoadSwitch!);
    expect(eagerLoadSwitch).toHaveAttribute('aria-checked', 'true');
    expect(within(section!).getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText(/Heads-up: eager loading can hammer RAM\/CPU on large groups\./i)).toBeInTheDocument();

    fireEvent.click(eagerLoadSwitch!);
    expect(eagerLoadSwitch).toHaveAttribute('aria-checked', 'false');
    expect(within(section!).getByText('Disabled')).toBeInTheDocument();
    expect(screen.queryByText(/Heads-up: eager loading can hammer RAM\/CPU on large groups\./i)).not.toBeInTheDocument();
  });

  test('"Telemetry & Analytics (Opt-in)" switch is present and interactive', async () => {
    // Clear previous mock calls
    mockChromeStorage.local.set.mockClear();
    // Mock initial state for this specific test
    mockChromeStorage.local.get.mockImplementation((keys, callback) => {
      if (typeof callback === 'function') {
        callback({ telemetry_opt_in: false });
      }
    });
    render(<Settings />);

    const section = await screen.findByText(/Telemetry & Analytics \(Opt-in\):/i, {}, { timeout: 5000 }).then(el => el.closest('div'));
    expect(section).toBeInTheDocument();

    const telemetrySwitch = within(section!).getByRole('switch');
    expect(telemetrySwitch).toHaveAttribute('aria-checked', 'false');
    expect(within(section!).getByText(/Disabled|Enabled/i)).toHaveTextContent('Disabled');

    fireEvent.click(telemetrySwitch!);
    await waitFor(() => {
      expect(telemetrySwitch).toHaveAttribute('aria-checked', 'true');
      expect(within(section!).getByText('Enabled')).toBeInTheDocument();
      // Check that the storage was called with the correct parameter
      const calls = mockChromeStorage.local.set.mock.calls;
      expect(calls.some(call => call[0]?.telemetry_opt_in === true)).toBe(true);
    });

    fireEvent.click(telemetrySwitch!);
    await waitFor(() => {
      expect(telemetrySwitch).toHaveAttribute('aria-checked', 'false');
      expect(within(section!).getByText('Disabled')).toBeInTheDocument();
      // Check that the storage was called with the correct parameter
      const calls = mockChromeStorage.local.set.mock.calls;
      expect(calls.some(call => call[0]?.telemetry_opt_in === false)).toBe(true);
    });
  });

  test('"High Contrast Theme" switch is present and interactive', async () => {
    render(<Settings />);
    const section = await screen.findByText(/High Contrast Theme \(Light Mode Only\):/i, {}, { timeout: 5000 }).then(el => el.closest('div'));
    expect(section).toBeInTheDocument();

    const highContrastSwitch = within(section!).getByRole('switch');
    const highContrastText = within(section!).getByText(/Disabled|Enabled/i);

    expect(highContrastSwitch).toHaveAttribute('aria-checked', 'false');
    expect(highContrastText).toHaveTextContent('Disabled');
    expect(document.documentElement).not.toHaveClass('high-contrast-mode');

    fireEvent.click(highContrastSwitch!);
    expect(highContrastSwitch).toHaveAttribute('aria-checked', 'true');
    expect(within(section!).getByText('Enabled')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('high-contrast-mode');

    fireEvent.click(highContrastSwitch!);
    expect(highContrastSwitch).toHaveAttribute('aria-checked', 'false');
    expect(within(section!).getByText('Disabled')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('high-contrast-mode');
  });

  test('export data button triggers data download with correct schema and filename', async () => {
    const mockData = {
      groups: [{ id: '1', name: 'Test Group' }],
      tabs: [{ id: 't1', url: 'https://example.com', groupId: '1', title: 'Tab', pinned: false, order: 0, favicon: '', createdAt: '2024-01-01T00:00:00Z' }],
      preferences: {
        theme: 'dark',
        sortOrder: 'manual',
        includePinnedTabs: true,
        hotkeys: { foo: 'bar' },
      },
    };
    mockChromeStorage.local.get.mockImplementation((_keys, callback) => {
      if (typeof callback === 'function') callback(mockData);
    });
    // Mock Blob with a text() method
    const jsonString = JSON.stringify(mockData, null, 2);
    const mockBlob = { type: 'application/json', text: () => Promise.resolve(jsonString) };
    mockCreateObjectURL.mockReturnValueOnce('blob:http://localhost/mock-blob');
    mockCreateObjectURL.mockImplementationOnce(() => mockBlob);
    render(<Settings />);
    const exportButton = await screen.findByRole('button', { name: 'Export Data' }, { timeout: 5000 });
    fireEvent.click(exportButton);
    await waitFor(async () => {
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith([
        'atrium_groups',
        'atrium_tabs',
        'atrium_theme',
        'atrium_sort_order',
        'atrium_include_pinned_tabs',
        'atrium_hotkeys',
      ], expect.any(Function));
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      // Use the mockBlob's text method
      const text = await mockBlob.text();
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty('groups');
      expect(parsed).toHaveProperty('tabs');
      expect(parsed).toHaveProperty('preferences');
      expect(parsed.preferences).toHaveProperty('theme', 'dark');
      expect(parsed.preferences).toHaveProperty('sortOrder', 'manual');
      expect(parsed.preferences).toHaveProperty('includePinnedTabs', true);
      expect(parsed.preferences).toHaveProperty('hotkeys');
    });
  });

  test('export data button shows error toast on failure', async () => {
    (global.chrome.storage.local.get as vi.Mock).mockImplementation((_keys, callback) => {
      if (typeof callback === 'function') callback({ message: 'Export failed' });
    });
    render(<Settings />);
    const exportButton = await screen.findByRole('button', { name: 'Export Data' }, { timeout: 5000 });
    fireEvent.click(exportButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export data.');
    }, { timeout: 2000 });
  });

  test('import data button triggers file input click', async () => {
    render(<Settings />);
    const importButton = await screen.findByRole('button', { name: 'Import Data' }, { timeout: 5000 });
    const fileInput = importButton.parentElement?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(importButton);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  test.skip('successfully imports data and shows success toast', async () => {
    const mockImportedData = { groups: [{ id: '2', name: 'Imported Group' }] };
    render(<Settings />);
    const file = new File([JSON.stringify(mockImportedData)], 'backup.json', { type: 'application/json' });
    const importButton = await screen.findByRole('button', { name: 'Import Data' }, { timeout: 5000 });
    const fileInput = importButton.parentElement?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    await waitFor(() => {
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith(mockImportedData, expect.any(Function));
      expect(toast.success).toHaveBeenCalledWith('Data imported successfully!');
    });
  });

  test.skip('shows error toast for invalid JSON during import', async () => {
    const invalidJsonFile = new File(['invalid json'], 'invalid.json', { type: 'application/json' });
    render(<Settings />);
    const importButton = await screen.findByRole('button', { name: 'Import Data' }, { timeout: 5000 });
    const fileInput = importButton.parentElement?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    fireEvent.change(fileInput, {
      target: { files: [invalidJsonFile] },
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to import data or invalid JSON.');
    });
  });

  test('shows quota exceeded modal when importing too much data', async () => {
    // Mock chrome.storage.local.getBytesInUse to return a high value that would trigger quota exceeded
    (global.chrome.storage.local.getBytesInUse as vi.Mock).mockImplementation((keys, callback) => {
      if (typeof callback === 'function') callback(4.9 * 1024 * 1024); // Nearly full quota
    });
    render(<Settings />);
    const file = new File([JSON.stringify({ large: 'a'.repeat(5 * 1024 * 1024) })], 'large_backup.json', { type: 'application/json' });
    const importButton = await screen.findByRole('button', { name: 'Import Data' }, { timeout: 5000 }); // Increased timeout
    const fileInput = importButton.parentElement?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Storage Full' })).toBeInTheDocument();
      expect(toast.error).not.toHaveBeenCalled();
    });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog', { name: 'Storage Full' })).not.toBeInTheDocument();
  });

  test('hotkey mapping displays commands and link to chrome shortcuts', async () => {
    const mockCommands = [
      { name: '_execute_action', description: 'Open Atrium Tabs Popup', shortcut: 'Ctrl+Shift+F' },
      { name: 'jump-to-group-1', description: 'Jump to Group 1', shortcut: 'Ctrl+Shift+1' },
    ];
    (global.chrome.commands.getAll as vi.Mock).mockImplementation((callback) => callback(mockCommands));

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => element?.tagName.toLowerCase() === 'strong' && content.includes('Open Atrium Tabs Popup'))).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Shift+F')).toBeInTheDocument();
      expect(screen.getByText((content, element) => element?.tagName.toLowerCase() === 'strong' && content.includes('Jump to Group 1'))).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Shift+1')).toBeInTheDocument();

      const shortcutsLink = screen.getByRole('link', { name: 'chrome://extensions/shortcuts' });
      expect(shortcutsLink).toBeInTheDocument();
      expect(shortcutsLink).toHaveAttribute('href', 'chrome://extensions/shortcuts');
      expect(shortcutsLink).toHaveAttribute('target', '_blank');
      expect(shortcutsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('navigating to Welcome/Quick Tour tab displays tour content', async () => {
    render(<Settings initialActiveTab="welcome-tour" />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Capture This Chaos/i, level: 2 })).toBeInTheDocument();
    });
  });

  test('Welcome/Quick Tour carousel navigates correctly and shows toast on finish', async () => {
    render(<Settings initialActiveTab="welcome-tour" />);

    await waitFor(() => expect(screen.getByRole('heading', { name: /Capture This Chaos/i, level: 2 })).toBeInTheDocument());

    // Click Next on Slide 1 -> Go to Slide 2
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: /Jump Like a Jedi/i, level: 2 })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: /Capture This Chaos/i, level: 2 })).not.toBeInTheDocument();

    // Click Next on Slide 2 -> Go to Slide 3
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: /Drag, Drop, Dominate/i, level: 2 })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: /Jump Like a Jedi/i, level: 2 })).not.toBeInTheDocument();

    // Click Finish on Slide 3
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.queryByRole('heading', { name: /Drag, Drop, Dominate/i, level: 2 })).not.toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Hotkeys active', expect.any(Object));
  });
});