import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Popup from '../components/Popup';
import { getStorageUsage, checkDataIntegrity, getAllData } from '../utils/storage';

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

Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
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

// Mock utilities
jest.mock('../utils/storage', () => ({
  getStorageUsage: jest.fn(),
  checkDataIntegrity: jest.fn(),
  getAllData: jest.fn(),
  saveData: jest.fn(),
}));

describe('Popup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for storage and data integrity
    (getStorageUsage as jest.Mock).mockResolvedValue({ bytesInUse: 0, quotaBytes: mockChromeStorage.local.QUOTA_BYTES });
    (checkDataIntegrity as jest.Mock).mockResolvedValue(true);
    (getAllData as jest.Mock).mockResolvedValue({});
    (mockChromeStorage.local.get as jest.Mock).mockImplementation((_keys, callback) => callback({}));
    (mockChromeStorage.local.set as jest.Mock).mockImplementation((_data, callback) => callback());
    (mockChromeStorage.local.clear as jest.Mock).mockImplementation((callback) => callback());

    mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-blob');

    // Mock GroupList as it's a child component not relevant to Popup's direct logic being tested here
    jest.mock('../components/GroupList', () => () => <div data-testid="group-list">Group List</div>);
  });

  test('renders without crashing', async () => {
    render(<Popup />);
    expect(screen.getByText('Atrium Tabs')).toBeInTheDocument();
    await waitFor(() => expect(getStorageUsage).toHaveBeenCalled());
  });

  test('"Open Settings" button opens new tab to settings.html', async () => {
    render(<Popup />);
    const openSettingsButton = screen.getByRole('button', { name: 'Open Settings' });
    fireEvent.click(openSettingsButton);
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'chrome://extension-id/settings.html' });
  });

  test('shows storage warning at 50% capacity', async () => {
    (getStorageUsage as jest.Mock).mockResolvedValue({ bytesInUse: 2.5 * 1024 * 1024, quotaBytes: mockChromeStorage.local.QUOTA_BYTES });
    const toastSuccessSpy = jest.spyOn(require('react-hot-toast'), 'success');

    render(<Popup />);
    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith('Storage at 50% capacity.', { id: 'storage-warning', duration: Infinity });
    });
  });

  test('shows storage warning at 80% capacity', async () => {
    (getStorageUsage as jest.Mock).mockResolvedValue({ bytesInUse: 4 * 1024 * 1024, quotaBytes: mockChromeStorage.local.QUOTA_BYTES });
    const toastWarnSpy = jest.spyOn(require('react-hot-toast'), 'warn');

    render(<Popup />);
    await waitFor(() => {
      expect(toastWarnSpy).toHaveBeenCalledWith('Storage getting full: 80% capacity.', { id: 'storage-warning', duration: Infinity });
    });
  });

  test('shows storage error at 90% capacity', async () => {
    (getStorageUsage as jest.Mock).mockResolvedValue({ bytesInUse: 4.5 * 1024 * 1024, quotaBytes: mockChromeStorage.local.QUOTA_BYTES });
    const toastErrorSpy = jest.spyOn(require('react-hot-toast'), 'error');

    render(<Popup />);
    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Storage nearly full: 90% capacity. Export or delete data.', { id: 'storage-warning', duration: Infinity });
    });
  });

  test('dismisses storage warning when usage is below 50%', async () => {
    (getStorageUsage as jest.Mock).mockResolvedValue({ bytesInUse: 1 * 1024 * 1024, quotaBytes: mockChromeStorage.local.QUOTA_BYTES });
    const toastDismissSpy = jest.spyOn(require('react-hot-toast'), 'dismiss');

    render(<Popup />);
    await waitFor(() => {
      expect(toastDismissSpy).toHaveBeenCalledWith('storage-warning');
    });
  });

  test('shows data corruption modal when integrity check fails', async () => {
    (checkDataIntegrity as jest.Mock).mockResolvedValue(false);
    render(<Popup />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Data Corruption Detected' })).toBeInTheDocument();
    });
  });

  test('"Export Raw Data" button in corruption modal triggers download', async () => {
    (checkDataIntegrity as jest.Mock).mockResolvedValue(false);
    const mockCorruptedData = { corrupted: true };
    (getAllData as jest.Mock).mockResolvedValue(mockCorruptedData);
    const toastSuccessSpy = jest.spyOn(require('react-hot-toast'), 'success');

    render(<Popup />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Data Corruption Detected' })).toBeInTheDocument();
    });

    const exportRawDataButton = screen.getByRole('button', { name: 'Export Raw Data' });
    fireEvent.click(exportRawDataButton);

    await waitFor(() => {
      expect(getAllData).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      expect(blobArg.type).toBe('application/json');
      expect(blobArg.size).toBe(new TextEncoder().encode(JSON.stringify(mockCorruptedData, null, 2)).length);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob');
      expect(toastSuccessSpy).toHaveBeenCalledWith('Raw data exported successfully!');
      expect(screen.queryByRole('dialog', { name: 'Data Corruption Detected' })).not.toBeInTheDocument();
    });
  });

  test('"Attempt Auto-Repair" button in corruption modal reloads extension', async () => {
    (checkDataIntegrity as jest.Mock).mockResolvedValue(false);
    render(<Popup />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Data Corruption Detected' })).toBeInTheDocument();
    });

    const autoRepairButton = screen.getByRole('button', { name: 'Attempt Auto-Repair' });
    fireEvent.click(autoRepairButton);

    await waitFor(() => {
      expect(chrome.runtime.reload).toHaveBeenCalledTimes(1);
    });
  });

  test('"Start Fresh" button in corruption modal clears storage and reloads extension', async () => {
    (checkDataIntegrity as jest.Mock).mockResolvedValue(false);
    const toastSuccessSpy = jest.spyOn(require('react-hot-toast'), 'success');

    render(<Popup />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Data Corruption Detected' })).toBeInTheDocument();
    });

    const startFreshButton = screen.getByRole('button', { name: 'Start Fresh' });
    fireEvent.click(startFreshButton);

    await waitFor(() => {
      expect(mockChromeStorage.local.clear).toHaveBeenCalledTimes(1);
      expect(toastSuccessSpy).toHaveBeenCalledWith('Storage cleared. Starting fresh!');
      expect(chrome.runtime.reload).toHaveBeenCalledTimes(1);
    });
  });
});