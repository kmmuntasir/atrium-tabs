import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../components/Settings';

// Mock chrome API
const mockChromeStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    getBytesInUse: jest.fn(),
    QUOTA_BYTES: 5 * 1024 * 1024, // 5MB
    clear: jest.fn(),
  },
};

const mockChromeCommands = {
  getAll: jest.fn(),
};

Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
    commands: mockChromeCommands,
    runtime: {
      getURL: (path: string) => `chrome://extension-id/${path}`,
      reload: jest.fn(),
      lastError: undefined,
    },
    tabs: {
      create: jest.fn(),
    },
  },
  writable: true,
});

// Mock global URL functions for blob downloads
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  dismiss: jest.fn(),
}));

describe('Settings Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default successful mocks
    mockChromeStorage.local.get.mockImplementation((_keys, callback) => callback({}));
    mockChromeStorage.local.set.mockImplementation((_data, callback) => callback());
    mockChromeStorage.local.getBytesInUse.mockImplementation((_keys, callback) => callback(0));
    mockChromeCommands.getAll.mockImplementation((callback) => callback([]));

    mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-blob');
  });

  test('renders without crashing', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('sort order radio buttons are present and interactive', () => {
    render(<Settings />);

    const alphabeticalRadio = screen.getByLabelText('Alphabetical');
    const lastUsageRadio = screen.getByLabelText('Last Usage');
    const manualRadio = screen.getByLabelText('Manual (Drag & Drop)');

    expect(alphabeticalRadio).toBeChecked();
    expect(lastUsageRadio).not.toBeChecked();
    expect(manualRadio).not.toBeChecked();

    fireEvent.click(lastUsageRadio);
    expect(lastUsageRadio).toBeChecked();
    expect(alphabeticalRadio).not.toBeChecked();

    fireEvent.click(manualRadio);
    expect(manualRadio).toBeChecked();
    expect(lastUsageRadio).not.toBeChecked();
  });

  test('theme radio buttons are present and interactive', () => {
    render(<Settings />);

    const systemThemeRadio = screen.getByLabelText('System');
    const lightThemeRadio = screen.getByLabelText('Light');
    const darkThemeRadio = screen.getByLabelText('Dark');

    expect(systemThemeRadio).toBeChecked();
    expect(lightThemeRadio).not.toBeChecked();
    expect(darkThemeRadio).not.toBeChecked();

    fireEvent.click(lightThemeRadio);
    expect(lightThemeRadio).toBeChecked();
    expect(systemThemeRadio).not.toBeChecked();

    fireEvent.click(darkThemeRadio);
    expect(darkThemeRadio).toBeChecked();
    expect(lightThemeRadio).not.toBeChecked();
  });

  test('"Include Pinned Tabs in Groups" switch is present and interactive', () => {
    render(<Settings />);

    const pinnedTabsSwitch = screen.getByRole('switch', { name: 'Include Pinned Tabs in Groups:' });
    const pinnedTabsText = screen.getByText('No');

    expect(pinnedTabsSwitch).not.toBeChecked();
    expect(pinnedTabsText).toBeInTheDocument();

    fireEvent.click(pinnedTabsSwitch);
    expect(pinnedTabsSwitch).toBeChecked();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(pinnedTabsText).not.toBeInTheDocument();
  });

  test('"Eager Load" switch is present, interactive, and shows warning', () => {
    render(<Settings />);

    const eagerLoadSwitch = screen.getByRole('switch', { name: 'Eager Load:' });
    const eagerLoadText = screen.getByText('Disabled');

    expect(eagerLoadSwitch).not.toBeChecked();
    expect(eagerLoadText).toBeInTheDocument();
    expect(screen.queryByText('Heads-up: eager loading can hammer RAM/CPU on large groups.')).not.toBeInTheDocument();

    fireEvent.click(eagerLoadSwitch);
    expect(eagerLoadSwitch).toBeChecked();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(eagerLoadText).not.toBeInTheDocument();
    expect(screen.getByText('Heads-up: eager loading can hammer RAM/CPU on large groups.')).toBeInTheDocument();

    fireEvent.click(eagerLoadSwitch);
    expect(eagerLoadSwitch).not.toBeChecked();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.queryByText('Heads-up: eager loading can hammer RAM/CPU on large groups.')).not.toBeInTheDocument();
  });

  test('export data button triggers data download and success toast', async () => {
    const mockData = { groups: [{ id: '1', name: 'Test Group' }] };
    mockChromeStorage.local.get.mockImplementation((_keys, callback) => callback(mockData));
    const toastSuccessSpy = jest.spyOn(require('react-hot-toast'), 'success');

    render(<Settings />);

    const exportButton = screen.getByRole('button', { name: 'Export Data' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(null, expect.any(Function));
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      expect(blobArg.type).toBe('application/json');
      // Basic check for content, more robust parsing could be done if needed
      expect(blobArg.size).toBe(new TextEncoder().encode(JSON.stringify(mockData, null, 2)).length);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob');
      expect(toastSuccessSpy).toHaveBeenCalledWith('Data exported successfully!');
    });
  });

  test('export data button shows error toast on failure', async () => {
    mockChromeStorage.local.get.mockImplementation((_keys, callback) => callback(new Error('Export failed')));
    const toastErrorSpy = jest.spyOn(require('react-hot-toast'), 'error');

    render(<Settings />);

    const exportButton = screen.getByRole('button', { name: 'Export Data' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(null, expect.any(Function));
      expect(toastErrorSpy).toHaveBeenCalledWith('Failed to export data.');
    });
  });

  test('import data button triggers file input click', () => {
    render(<Settings />);

    const importButton = screen.getByRole('button', { name: 'Import Data' });
    const fileInput = screen.getByLabelText('Import/Export:').nextElementSibling?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    const clickSpy = jest.spyOn(fileInput, 'click');
    fireEvent.click(importButton);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  test('successfully imports data and shows success toast', async () => {
    const mockImportedData = { groups: [{ id: '2', name: 'Imported Group' }] };
    const toastSuccessSpy = jest.spyOn(require('react-hot-toast'), 'success');

    render(<Settings />);

    const file = new File([JSON.stringify(mockImportedData)], 'backup.json', { type: 'application/json' });
    const fileInput = screen.getByLabelText('Import/Export:').nextElementSibling?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(mockImportedData, expect.any(Function));
      expect(toastSuccessSpy).toHaveBeenCalledWith('Data imported successfully!');
    });
  });

  test('shows error toast for invalid JSON during import', async () => {
    const invalidJsonFile = new File(['invalid json'], 'invalid.json', { type: 'application/json' });
    const toastErrorSpy = jest.spyOn(require('react-hot-toast'), 'error');

    render(<Settings />);

    const fileInput = screen.getByLabelText('Import/Export:').nextElementSibling?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    fireEvent.change(fileInput, {
      target: { files: [invalidJsonFile] },
    });

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Failed to import data or invalid JSON.');
    });
  });

  test('shows quota exceeded modal when importing too much data', async () => {
    const largeData = { large: 'a'.repeat(5 * 1024 * 1024) }; // Exceeds 5MB quota
    const toastErrorSpy = jest.spyOn(require('react-hot-toast'), 'error');

    mockChromeStorage.local.set.mockImplementation((_data, callback) => {
      callback(); // Simulate success from chrome.storage.local.set
      // Manually trigger the quota exceeded error from saveData utility
      const error = new Error('STORAGE_QUOTA_EXCEEDED');
      Object.defineProperty(error, 'message', { value: 'STORAGE_QUOTA_EXCEEDED' });
      throw error;
    });

    render(<Settings />);

    const file = new File([JSON.stringify(largeData)], 'large_backup.json', { type: 'application/json' });
    const fileInput = screen.getByLabelText('Import/Export:').nextElementSibling?.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Storage Full' })).toBeInTheDocument();
      expect(toastErrorSpy).not.toHaveBeenCalled(); // No generic error toast, but modal instead
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
    mockChromeCommands.getAll.mockImplementation((callback) => callback(mockCommands));

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Open Atrium Tabs Popup:')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Shift+F')).toBeInTheDocument();
      expect(screen.getByText('Jump to Group 1:')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Shift+1')).toBeInTheDocument();

      const shortcutsLink = screen.getByRole('link', { name: 'chrome://extensions/shortcuts' });
      expect(shortcutsLink).toBeInTheDocument();
      expect(shortcutsLink).toHaveAttribute('href', 'chrome://extensions/shortcuts');
      expect(shortcutsLink).toHaveAttribute('target', '_blank');
      expect(shortcutsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('navigating to Welcome/Quick Tour tab displays tour content', async () => {
    render(<Settings />);

    const welcomeTourTab = screen.getByRole('tab', { name: 'Welcome/Quick Tour' });
    fireEvent.click(welcomeTourTab);

    await waitFor(() => {
      expect(screen.getByText('Welcome/Quick Tour')).toBeInTheDocument();
      expect(screen.getByText('Slide 1: Capture This Chaos')).toBeInTheDocument();
    });
  });

  test('Welcome/Quick Tour carousel navigates correctly', async () => {
    const toastSuccessSpy = jest.spyOn(require('react-hot-toast'), 'success');
    render(<Settings />);

    // Go to Welcome/Quick Tour tab
    fireEvent.click(screen.getByRole('tab', { name: 'Welcome/Quick Tour' }));
    await waitFor(() => expect(screen.getByText('Slide 1: Capture This Chaos')).toBeInTheDocument());

    // Click Next on Slide 1 -> Go to Slide 2
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('Slide 2: Jump Like a Jedi')).toBeInTheDocument());
    expect(screen.queryByText('Slide 1: Capture This Chaos')).not.toBeInTheDocument();

    // Click Next on Slide 2 -> Go to Slide 3
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('Slide 3: Drag, Drop, Dominate')).toBeInTheDocument());
    expect(screen.queryByText('Slide 2: Jump Like a Jedi')).not.toBeInTheDocument();

    // Click Back on Slide 3 -> Go to Slide 2
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByText('Slide 2: Jump Like a Jedi')).toBeInTheDocument());
    expect(screen.queryByText('Slide 3: Drag, Drop, Dominate')).not.toBeInTheDocument();

    // Click Back on Slide 2 -> Go to Slide 1
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByText('Slide 1: Capture This Chaos')).toBeInTheDocument());
    expect(screen.queryByText('Slide 2: Jump Like a Jedi')).not.toBeInTheDocument();

    // Click Skip Tour on Slide 1 -> Go back to General tab
    fireEvent.click(screen.getByRole('button', { name: 'Skip Tour' }));
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.queryByText('Welcome/Quick Tour')).not.toBeInTheDocument();
    });

    // Go back to Welcome/Quick Tour tab to test Finish button
    fireEvent.click(screen.getByRole('tab', { name: 'Welcome/Quick Tour' }));
    await waitFor(() => expect(screen.getByText('Slide 1: Capture This Chaos')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); // Slide 2
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); // Slide 3
    await waitFor(() => expect(screen.getByText('Slide 3: Drag, Drop, Dominate')).toBeInTheDocument());

    // Click Finish on Slide 3 -> Go back to General tab and show toast
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.queryByText('Welcome/Quick Tour')).not.toBeInTheDocument();
      expect(toastSuccessSpy).toHaveBeenCalledWith('Hotkeys active!');
    });
  });
});