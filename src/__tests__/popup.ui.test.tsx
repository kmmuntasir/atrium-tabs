import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Popup from '../components/Popup';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Mock toast notifications
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  dismiss: vi.fn(),
};
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: mockToast,
  ...mockToast,
}));

// Mock chrome.runtime.sendMessage for testing messages sent to the runtime
const mockSendMessage = vi.fn();

Object.defineProperty(global, 'chrome', {
  value: {
    runtime: {
      sendMessage: mockSendMessage,
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      getURL: vi.fn(() => 'chrome://extension-id/settings.html'), // Mock for settings page URL
      getManifest: vi.fn(() => ({ version: '1.0.0' })), // Mock for extension version
      lastError: undefined,
      reload: vi.fn(),
    },
    storage: {
      local: {
        get: vi.fn(() => Promise.resolve({})), // Mock for storage.local.get
        set: vi.fn(() => Promise.resolve()), // Mock for storage.local.set
        getBytesInUse: vi.fn(() => Promise.resolve(0)), // Mock for storage.local.getBytesInUse
        QUOTA_BYTES: 5 * 1024 * 1024, // 5MB
        clear: vi.fn(() => Promise.resolve()), // Mock for storage.local.clear
      },
    },
    alarms: {
      create: vi.fn(),
      onAlarm: {
        addListener: vi.fn(),
      },
      get: vi.fn((_, callback) => callback(undefined)), // Mock for alarms.get
    },
    tabs: {
      create: vi.fn(),
    },
  },
  configurable: true,
});

describe('Popup UI', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    vi.clearAllMocks();
  });

  it('renders popup heading', () => {
    render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );
    expect(screen.getByText('Atrium Tabs')).toBeInTheDocument();
  });
  it('is accessible', async () => {
    const { container } = render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows storage full modal when STORAGE_FULL message is received', async () => {
    render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );

    // Simulate STORAGE_FULL message
    const listener = (chrome.runtime.onMessage.addListener as vi.Mock).mock.calls[0][0];
    await listener({
      type: 'STORAGE_FULL',
      payload: {
        message: 'Storage full. Export or delete some groups before continuing.'
      },
    }, {}, () => {});

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Storage Full/i })).toBeInTheDocument();
    });
    expect(screen.getByText('Storage full. Export or delete some groups before continuing.')).toBeInTheDocument();

    const results = await axe(screen.getByRole('dialog'));
    expect(results).toHaveNoViolations();
  });

  it('shows storage warning toasts when STORAGE_WARNING messages are received', async () => {
    render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );

    const listener = (chrome.runtime.onMessage.addListener as vi.Mock).mock.calls[0][0];

    // Test critical warning
    await listener({
      type: 'STORAGE_WARNING',
      payload: { message: 'Critical warning', level: 'critical' },
    }, {}, () => {});
    expect(mockToast.error).toHaveBeenCalledWith('Critical warning', { id: 'storage-warning', duration: Infinity });

    // Test high warning
    await listener({
      type: 'STORAGE_WARNING',
      payload: { message: 'High warning', level: 'high' },
    }, {}, () => {});
    expect(mockToast.warn).toHaveBeenCalledWith('High warning', { id: 'storage-warning', duration: Infinity });

    // Test medium warning
    await listener({
      type: 'STORAGE_WARNING',
      payload: { message: 'Medium warning', level: 'medium' },
    }, {}, () => {});
    expect(mockToast.success).toHaveBeenCalledWith('Medium warning', { id: 'storage-warning', duration: Infinity });

    // Test dismiss
    await listener({
      type: 'STORAGE_WARNING',
      payload: { message: 'Dismiss warning', level: 'none' }, // Simulate a non-warning to dismiss
    }, {}, () => {});
    // Dismiss is called in Popup.tsx if usagePercentage is not in the warning range
    // The test setup for Popup renders it first, then it checks initial storage usage
    // and dismisses the toast if usage is low. So, we'll check it here.
    expect(mockToast.dismiss).toHaveBeenCalledWith('storage-warning');
  });
});
