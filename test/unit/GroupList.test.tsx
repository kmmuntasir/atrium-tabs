import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import GroupList from '../../src/components/GroupList';
import * as GroupStorage from '../../src/storage/GroupStorage';
import { Group } from '../../src/types/Group';
import { vi } from 'vitest';
import { within } from '@testing-library/react';

// Mock chrome API
const mockChrome = {
  windows: {
    getCurrent: vi.fn(() => Promise.resolve({ id: 100 })),
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
    create: vi.fn(),
    remove: vi.fn(),
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

Object.defineProperty(global, 'chrome', { value: mockChrome });

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
      // Simulate storage event for listeners
      const event = new Event('storage');
      Object.defineProperty(event, 'key', { value: key });
      Object.defineProperty(event, 'newValue', { value: value });
      window.dispatchEvent(event);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GroupList Component - ATRIUM-0026', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(mockChrome.windows.getCurrent).mockClear();
    vi.mocked(mockChrome.tabs.query).mockClear();
    vi.mocked(mockChrome.tabs.create).mockClear();
    vi.mocked(mockChrome.tabs.remove).mockClear();
    vi.mocked(mockChrome.windows.onRemoved.addListener).mockClear();
    vi.mocked(mockChrome.tabs.onActivated.addListener).mockClear();
    vi.mocked(mockChrome.tabs.onRemoved.addListener).mockClear();
    vi.mocked(mockChrome.tabs.onUpdated.addListener).mockClear();
    vi.spyOn(GroupStorage, 'getGroups').mockReturnValue([]);
    vi.spyOn(GroupStorage, 'setActiveGroupForWindow').mockImplementation(() => {});
    vi.spyOn(GroupStorage, 'getActiveGroupForWindow').mockReturnValue(null);
    vi.spyOn(GroupStorage, 'getWindowIdForActiveGroup').mockReturnValue(null);
    vi.spyOn(GroupStorage, 'removeActiveGroupForWindow').mockImplementation(() => {});
  });

  const mockGroup1: Group = {
    uuid: 'group-1',
    name: 'Work Group',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: '#FF0000',
    icon: 'Briefcase',
    order: 0,
    lastActiveAt: Date.now(),
    tabs: [],
    isDeleted: false,
  };

  const mockGroup2: Group = {
    uuid: 'group-2',
    name: 'Personal Group',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: '#0000FF',
    icon: 'Home',
    order: 1,
    lastActiveAt: Date.now(),
    tabs: [],
    isDeleted: false,
  };

  test('should display a lock icon for a group active in another window', async () => {
    mockChrome.windows.getCurrent.mockResolvedValueOnce({ id: 100 });
    const groupActiveInOtherWindow: Group = { ...mockGroup1, activeInWindowId: 200 };
    vi.mocked(GroupStorage.getGroups).mockReturnValue([groupActiveInOtherWindow, mockGroup2]);

    render(<GroupList />);

    await waitFor(() => {
      const groupElement = screen.getByText(/Work Group/i).closest('li');
      expect(groupElement).toBeInTheDocument();
      expect(groupElement).toHaveTextContent('Work Group (0 tabs)');
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });
  });

  test('should disable activate button for a group active in another window', async () => {
    mockChrome.windows.getCurrent.mockResolvedValueOnce({ id: 100 });
    const groupActiveInOtherWindow: Group = { ...mockGroup1, activeInWindowId: 200 };
    vi.mocked(GroupStorage.getGroups).mockReturnValue([groupActiveInOtherWindow, mockGroup2]);

    render(<GroupList />);

    await waitFor(() => {
      const groupElement = screen.getByText(/Work Group/i).closest('li');
      expect(groupElement).toBeInTheDocument();
      const activateButton = within(groupElement!).getByRole('button', { name: /Activate/i });
      expect(activateButton).toBeDisabled();
    });
  });

  test('should disable open in new window button for a group active in another window', async () => {
    mockChrome.windows.getCurrent.mockResolvedValueOnce({ id: 100 });
    const groupActiveInOtherWindow: Group = { ...mockGroup1, activeInWindowId: 200 };
    vi.mocked(GroupStorage.getGroups).mockReturnValue([groupActiveInOtherWindow, mockGroup2]);

    render(<GroupList />);

    await waitFor(() => {
      const groupElement = screen.getByText(/Work Group/i).closest('li');
      expect(groupElement).toBeInTheDocument();
      const openInNewWindowButton = within(groupElement!).getByRole('button', { name: /Open in New Window/i });
      expect(openInNewWindowButton).toBeDisabled();
    });
  });

  test('should disable edit button for a group active in another window', async () => {
    mockChrome.windows.getCurrent.mockResolvedValueOnce({ id: 100 });
    const groupActiveInOtherWindow: Group = { ...mockGroup1, activeInWindowId: 200 };
    vi.mocked(GroupStorage.getGroups).mockReturnValue([groupActiveInOtherWindow, mockGroup2]);

    render(<GroupList />);

    await waitFor(() => {
      const groupElement = screen.getByText(/Work Group/i).closest('li');
      expect(groupElement).toBeInTheDocument();
      const editButton = within(groupElement!).getByRole('button', { name: /Edit/i });
      expect(editButton).toBeDisabled();
    });
  });

  test('should disable delete button for a group active in another window', async () => {
    mockChrome.windows.getCurrent.mockResolvedValueOnce({ id: 100 });
    const groupActiveInOtherWindow: Group = { ...mockGroup1, activeInWindowId: 200 };
    vi.mocked(GroupStorage.getGroups).mockReturnValue([groupActiveInOtherWindow, mockGroup2]);

    render(<GroupList />);

    await waitFor(() => {
      const groupElement = screen.getByText(/Work Group/i).closest('li');
      expect(groupElement).toBeInTheDocument();
      const deleteButton = within(groupElement!).getByRole('button', { name: /Delete/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  test('should prevent group expansion if active in another window', async () => {
    mockChrome.windows.getCurrent.mockResolvedValueOnce({ id: 100 });
    const groupActiveInOtherWindow: Group = { ...mockGroup1, activeInWindowId: 200, tabs: [{ uuid: 'tab-1', groupId: 'group-1', title: 'Tab 1', url: 'http://tab1.com', favIconUrl: '', createdAt: Date.now(), lastAccessedAt: Date.now(), order: 0, isPinned: false, isOpen: true }] };
    vi.mocked(GroupStorage.getGroups).mockReturnValue([groupActiveInOtherWindow]);

    render(<GroupList />);

    await waitFor(() => {
      const groupElement = screen.getByText(/Work Group/i).closest('li');
      expect(groupElement).toBeInTheDocument();
      const expandButton = within(groupElement!).getByRole('button', { name: /\+|\-/i }); // Matches both + and -
      expect(expandButton).toBeDisabled(); // The button itself should be disabled if group is locked
    });
  });
});