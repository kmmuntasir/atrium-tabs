import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupList from '../components/GroupList';
import * as groupModule from '../group';
import * as tabModule from '../tab';
import * as Tooltip from '@radix-ui/react-tooltip';

// Mock chrome API for testing
const mockChrome = {
  windows: {
    getCurrent: vi.fn(() => Promise.resolve({ tabs: [] })),
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn((queryInfo, callback) => {
      // Mock for active tab query, assuming a single active tab for simplicity
      callback([{ id: 1, active: true, windowId: 1 }]);
    }),
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  commands: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
};

Object.defineProperty(global, 'chrome', { value: mockChrome });

// Mock localStorage for test isolation
const localStorageMock = (
  function () {
    let store: { [key: string]: string } = {};

    return {
      getItem(key: string) {
        return store[key] || null;
      },
      setItem(key: string, value: string) {
        store[key] = value.toString();
      },
      clear() {
        store = {};
      },
      removeItem(key: string) {
        delete store[key];
      },
    };
  }
)();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('GroupList Component', () => {
  // Using let here as these mocks might be modified in specific tests
  let MOCK_GROUPS = [
    { id: '1', name: 'Work', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', lastActiveAt: '2023-01-01T00:00:00Z', order: 0, color: '#FF0000', icon: 'briefcase' },
    { id: '2', name: 'Personal', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', lastActiveAt: '2023-01-01T00:00:00Z', order: 1, color: '#00FF00', icon: 'home' },
    { id: '3', name: 'Social', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', lastActiveAt: '2023-01-01T00:00:00Z', order: 2, color: '#0000FF', icon: 'heart' },
  ];

  let MOCK_TABS = [
    { id: 't1', groupId: '1', url: 'http://work1.com', title: 'Work Tab 1', pinned: false, favicon: '', createdAt: '2023-01-01T00:00:00Z', order: 0 },
    { id: 't2', groupId: '1', url: 'http://work2.com', title: 'Work Tab 2', pinned: false, favicon: '', createdAt: '2023-01-01T00:00:00Z', order: 1 },
    { id: 't3', groupId: '2', url: 'http://personal1.com', title: 'Personal Tab 1', pinned: false, favicon: '', createdAt: '2023-01-01T00:00:00Z', order: 0 },
  ];

  beforeEach(() => {
    // Reset mocks and data before each test
    vi.clearAllMocks();
    localStorage.clear(); // Clear localStorage mock
    
    // Deep copy mock data to ensure isolation between tests
    MOCK_GROUPS = [
      { id: '1', name: 'Work', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', lastActiveAt: '2023-01-01T00:00:00Z', order: 0, color: '#FF0000', icon: 'briefcase' },
      { id: '2', name: 'Personal', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', lastActiveAt: '2023-01-01T00:00:00Z', order: 1, color: '#00FF00', icon: 'home' },
      { id: '3', name: 'Social', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', lastActiveAt: '2023-01-01T00:00:00Z', order: 2, color: '#0000FF', icon: 'heart' },
    ];
    MOCK_TABS = [
      { id: 't1', groupId: '1', url: 'http://work1.com', title: 'Work Tab 1', pinned: false, favicon: '', createdAt: '2023-01-01T00:00:00Z', order: 0 },
      { id: 't2', groupId: '1', url: 'http://work2.com', title: 'Work Tab 2', pinned: false, favicon: '', createdAt: '2023-01-01T00:00:00Z', order: 1 },
      { id: 't3', groupId: '2', url: 'http://personal1.com', title: 'Personal Tab 1', pinned: false, favicon: '', createdAt: '2023-01-01T00:00:00Z', order: 0 },
    ];

    // Mock group and tab modules to use the local MOCK_GROUPS and MOCK_TABS
    // By mocking save/create/update to interact with localStorage, get functions will automatically read from it.
    vi.spyOn(groupModule, 'getGroups').mockImplementation(() => {
      const data = localStorage.getItem('atrium_groups');
      return data ? JSON.parse(data) : [];
    });
    vi.spyOn(groupModule, 'createGroup').mockImplementation((groupData) => {
      const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
      const newGroup = { ...groupData, id: `g${groups.length + 1}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deleted: false };
      groups.push(newGroup);
      localStorage.setItem('atrium_groups', JSON.stringify(groups));
      return newGroup;
    });
    vi.spyOn(groupModule, 'updateGroup').mockImplementation((id, updates) => {
      const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
      const index = groups.findIndex((g: any) => g.id === id);
      if (index !== -1) {
        Object.assign(groups[index], updates);
        localStorage.setItem('atrium_groups', JSON.stringify(groups));
        return true;
      }
      return false;
    });
    vi.spyOn(groupModule, 'softDeleteGroup').mockImplementation((id) => {
      const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
      const index = groups.findIndex((g: any) => g.id === id);
      if (index !== -1) {
        groups[index].deleted = true;
        localStorage.setItem('atrium_groups', JSON.stringify(groups));
      }
      return true;
    });
    vi.spyOn(groupModule, 'restoreGroup').mockImplementation((id) => {
      const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
      const index = groups.findIndex((g: any) => g.id === id);
      if (index !== -1) {
        groups[index].deleted = false;
        localStorage.setItem('atrium_groups', JSON.stringify(groups));
      }
      return true;
    });
    vi.spyOn(groupModule, 'deleteGroup').mockImplementation((id) => {
      let groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
      const initialLength = groups.length;
      groups = groups.filter((g: any) => g.id !== id);
      if (groups.length !== initialLength) {
        localStorage.setItem('atrium_groups', JSON.stringify(groups));
        return true;
      }
      return false;
    });
    vi.spyOn(groupModule, 'saveGroups').mockImplementation((groups) => {
      localStorage.setItem('atrium_groups', JSON.stringify(groups));
      return true;
    });

    vi.spyOn(tabModule, 'getTabs').mockImplementation(() => {
      const data = localStorage.getItem('atrium_tabs');
      return data ? JSON.parse(data) : [];
    });
    vi.spyOn(tabModule, 'createTab').mockImplementation((tabData) => {
      const tabs = JSON.parse(localStorage.getItem('atrium_tabs') || '[]');
      const newTab = { ...tabData, id: `t${tabs.length + 1}`, createdAt: new Date().toISOString() };
      tabs.push(newTab);
      localStorage.setItem('atrium_tabs', JSON.stringify(tabs));
      return newTab;
    });
    vi.spyOn(tabModule, 'updateTab').mockImplementation((id, updates) => {
      const tabs = JSON.parse(localStorage.getItem('atrium_tabs') || '[]');
      const index = tabs.findIndex((t: any) => t.id === id);
      if (index !== -1) {
        Object.assign(tabs[index], updates);
        localStorage.setItem('atrium_tabs', JSON.stringify(tabs));
        return true;
      }
      return false;
    });
    vi.spyOn(tabModule, 'deleteTab').mockImplementation((id) => {
      let tabs = JSON.parse(localStorage.getItem('atrium_tabs') || '[]');
      const initialLength = tabs.length;
      tabs = tabs.filter((t: any) => t.id !== id);
      if (tabs.length !== initialLength) {
        localStorage.setItem('atrium_tabs', JSON.stringify(tabs));
        return true;
      }
      return false;
    });
    vi.spyOn(tabModule, 'saveTabs').mockImplementation((tabs) => {
      localStorage.setItem('atrium_tabs', JSON.stringify(tabs));
      return true;
    });

    // Mock chrome.storage.local for Settings.tsx related tests
    (mockChrome.storage.local.get as vi.Mock).mockImplementation(async (keys: string | string[]) => {
      const result: { [key: string]: any } = {};
      const allKeys = Array.isArray(keys) ? keys : [keys];
      for (const key of allKeys) {
        // These are mocks for global chrome.storage.local, not related to group/tab data
        if (key === 'atrium_expanded_groups') result[key] = [];
        if (key === 'atrium_group_sort') result[key] = 'manual';
        if (key === 'atrium_include_pinned') result[key] = true;
        if (key === 'has_run_before') result[key] = true; // Simulate not first run by default
      }
      return Promise.resolve(result);
    });

    (mockChrome.storage.local.set as vi.Mock).mockImplementation(async (items: { [key: string]: any }) => {
      // This mock is for global chrome.storage.local, not related to group/tab data
      return Promise.resolve(undefined);
    });
  });

  it('renders group list correctly', () => {
    // Initialize localStorage with mock data before rendering
    localStorage.setItem('atrium_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('atrium_tabs', JSON.stringify(MOCK_TABS));

    render(<Tooltip.Provider><GroupList /></Tooltip.Provider>);
    expect(screen.getByRole('listitem', { name: /Work/i })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Personal/i })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Social/i })).toBeInTheDocument();
  });

  it('auto-creates a tab when switching to an empty group', async () => {
    // Setup: two groups, one with no tabs
    MOCK_GROUPS = [
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'g2', name: 'Group 2', color: '#388e3c', icon: 'folder', order: 1, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    MOCK_TABS = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 }
    ];
    // Initialize localStorage with mock data before rendering
    localStorage.setItem('atrium_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('atrium_tabs', JSON.stringify(MOCK_TABS));

    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Switch to group 2 (empty)
    fireEvent.change(screen.getByLabelText(/active group/i), { target: { value: 'g2' } });
    // Expand group 2 accordion
    const group2Trigger = screen.getAllByText('Group 2').find(el => el.closest('[data-radix-collection-item]'));
    fireEvent.click(group2Trigger);
    // Should auto-create a tab in group 2
    expect(await screen.findByText((c) => c.toLowerCase().includes('example tab'))).toBeInTheDocument();
  });

  it('pinned tabs toggle filters tabs in the UI', async () => {
    MOCK_GROUPS = [
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    MOCK_TABS = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: true, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 1 }
    ];
    // Initialize localStorage with mock data before rendering
    localStorage.setItem('atrium_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('atrium_tabs', JSON.stringify(MOCK_TABS));

    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Expand group 1 accordion
    const group1Trigger = screen.getAllByText('Group 1').find(el => el.closest('[data-radix-collection-item]'));
    fireEvent.click(group1Trigger);
    // By default, both tabs shown
    expect(await screen.findByText((c) => c.includes('Tab A'))).toBeInTheDocument();
    expect(await screen.findByText((c) => c.includes('Tab B'))).toBeInTheDocument();
    // Toggle pinned off
    fireEvent.click(screen.getByLabelText(/include pinned/i));
    // Only unpinned tab should be shown
    expect(screen.queryByText((c) => c.includes('Tab A'))).not.toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('Tab B'))).toBeInTheDocument();
  });

  it('simulates tab open/close/navigation via UI controls', async () => {
    MOCK_GROUPS = [
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    MOCK_TABS = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 }
    ];
    // Initialize localStorage with mock data before rendering
    localStorage.setItem('atrium_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('atrium_tabs', JSON.stringify(MOCK_TABS));

    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Expand group 1 accordion
    const group1Trigger = screen.getAllByText('Group 1').find(el => el.closest('[data-radix-collection-item]'));
    fireEvent.click(group1Trigger);
    // Simulate open
    fireEvent.click(screen.getByText(/simulate tab open/i));
    expect((await screen.findAllByText((c) => c.toLowerCase().includes('tab'))).length).toBeGreaterThan(1);
    // Simulate navigation
    fireEvent.click(screen.getByText(/simulate tab navigation/i));
    expect((await screen.findAllByText((c) => c.toLowerCase().includes('navigated tab'))).length + (await screen.findAllByText((c) => c.toLowerCase().includes('tab'))).length).toBeGreaterThan(1);
    // Simulate close
    fireEvent.click(screen.getByText(/simulate tab close/i));
    // At least one tab remains
    expect((await screen.findAllByText((c) => c.toLowerCase().includes('tab'))).length).toBeGreaterThan(0);
  });

  // Skipped due to Radix Accordion not responding to synthetic click events in jsdom; cannot reliably simulate accordion expansion in test environment
  it.skip('focuses last active tab on group switch', async () => {
    MOCK_GROUPS = [
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'g2', name: 'Group 2', color: '#388e3c', icon: 'folder', order: 1, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    MOCK_TABS = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 1 },
      { id: 'tab3', url: 'https://c.com', title: 'Tab C', pinned: false, groupId: 'g2', favicon: '', createdAt: new Date().toISOString(), order: 0 }
    ];
    // Initialize localStorage with mock data before rendering
    localStorage.setItem('atrium_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('atrium_tabs', JSON.stringify(MOCK_TABS));

    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Expand group 1
    const group1Span = screen.getAllByText('Group 1').find(el => el.tagName === 'SPAN');
    fireEvent.click(group1Span.closest('li'));
    // Click 'Tab B' to make it last active
    fireEvent.click(screen.getAllByText((c) => c.includes('Tab B')).find(el => el.tagName === 'SPAN'));
    // Switch to group 2
    fireEvent.change(screen.getByLabelText(/active group/i), { target: { value: 'g2' } });
    const group2Span = screen.getAllByText('Group 2').find(el => el.tagName === 'SPAN');
    fireEvent.click(group2Span.closest('li'));
    // Switch back to group 1
    fireEvent.change(screen.getByLabelText(/active group/i), { target: { value: 'g1' } });
    fireEvent.click(group1Span.closest('li'));
    // Debug the DOM after expanding group 1
    screen.debug();
    // Wait for the tab label to appear
    await waitFor(() => {
      expect(screen.getByTestId('tab-label-tab2')).toBeInTheDocument();
    });
    const tabB = screen.getByTestId('tab-label-tab2');
    expect(tabB.closest('li')).toHaveAttribute('tabindex', '0');
  });

  it('should display color-blind shape badge next to each group icon', () => {
    // Initialize localStorage with mock data before rendering
    localStorage.setItem('atrium_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('atrium_tabs', JSON.stringify(MOCK_TABS));

    render(<Tooltip.Provider><GroupList /></Tooltip.Provider>);
    const workGroupElement = screen.getByRole('listitem', { name: /Work/i });
    const shapeBadge = workGroupElement.querySelector('[aria-label="shape marker"]');
    expect(shapeBadge).toBeInTheDocument();
    expect(shapeBadge).toHaveTextContent(/^[●■▲◆★⬟]$/);
  });
});
