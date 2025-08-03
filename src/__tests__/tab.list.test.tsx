import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TabList from '../components/TabList';
import { undiscardTab } from '../background';
import { createTab } from '../tab';
import { act } from 'react-dom/test-utils';
import { getPreference } from '../utils/storage'; // Import getPreference

vi.mock('../background', async () => {
  return {
    undiscardTab: vi.fn(),
    discardTabs: vi.fn(),
  };
});

vi.mock('../tab', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // We will let the actual createTab function run, which uses chrome.tabs.create and getPreference
    // We only need to mock getPreference and chrome.tabs.create globally if we want to control their behavior
    createTab: vi.fn(actual.createTab),
  };
});

// We are mocking getPreference globally in test/setup.ts, so no need to mock it here
// vi.mock('../utils/storage', async (importOriginal) => {
//   const actual = await importOriginal();
//   return {
//     ...actual,
//     getPreference: vi.fn(),
//   };
// });

describe('Tab List', () => {
  // Clear mocks and reset state before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock storage and chrome tabs state controlled in setup.ts
    // No explicit call needed here as beforeEach in setup.ts handles it.
  });

  it('renders tab titles and favicons', () => {
    // Mock localStorage for getTabs
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), chromeTabId: 101 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString(), chromeTabId: 102 }
    ];
    render(<TabList groupId="g1" tabs={tabs} eagerLoad={false} />);
    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
    expect(screen.getAllByAltText('favicon')).toHaveLength(2);
  });

  it('calls onTabRemove when the remove button is clicked', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), chromeTabId: 101 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString(), chromeTabId: 102 }
    ];
    const onTabRemove = vi.fn();
    render(<TabList groupId="g1" tabs={tabs} onTabRemove={onTabRemove} eagerLoad={false} />);
    const removeButtons = screen.getAllByRole('button', { name: /remove tab/i });
    fireEvent.click(removeButtons[0]);
    expect(onTabRemove).toHaveBeenCalledWith('tab1');
  });

  // Skipped due to jsdom limitations: cannot reliably simulate drag-and-drop reorder in test environment
  it.skip('calls onTabReorder when a tab is dragged and dropped', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), chromeTabId: 101 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString(), chromeTabId: 102 }
    ];
    const onTabReorder = vi.fn();
    render(<TabList groupId="g1" tabs={tabs} onTabReorder={onTabReorder} eagerLoad={false} />);
    const tabItems = screen.getAllByRole('listitem');
    // Simulate drag and drop: drag tab 0 to position 1
    const dataTransfer = { setData: () => {}, getData: () => '' };
    fireEvent.dragStart(tabItems[0], { dataTransfer });
    fireEvent.dragEnter(tabItems[1], { dataTransfer });
    fireEvent.dragEnd(tabItems[0], { dataTransfer });
    expect(onTabReorder).toHaveBeenCalledWith(0, 1);
  });

  // Skipped due to jsdom limitations: cannot reliably simulate cross-group drag-and-drop
  it.skip('calls onTabDrop when a tab is dragged from another group and dropped', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), chromeTabId: 101 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString(), chromeTabId: 102 }
    ];
    const onTabDrop = vi.fn();
    render(<TabList groupId="g2" tabs={[]} onTabDrop={onTabDrop} eagerLoad={false} />);
    // Simulate drag from g1 to g2
    const ul = screen.getByRole('list');
    const dataTransfer = { getData: () => 'g1' };
    fireEvent.drop(ul, { dataTransfer, ctrlKey: false });
    expect(onTabDrop).toHaveBeenCalledWith('tab1', 'g1', 'g2', false);
  });

  it('does not call undiscardTab when tab is clicked and eagerLoad is true', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), discarded: true, chromeTabId: 101 }
    ];
    render(<TabList groupId="g1" tabs={tabs} eagerLoad={true} />);
    fireEvent.click(screen.getByText('Tab A'));
    expect(undiscardTab).not.toHaveBeenCalled();
  });

  it('calls undiscardTab when tab is clicked and eagerLoad is false and tab is discarded', async () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), discarded: true, chromeTabId: 102 }
    ];
    render(<TabList groupId="g1" tabs={tabs} eagerLoad={false} />);
    fireEvent.click(screen.getByText('Tab A'));
    expect(undiscardTab).toHaveBeenCalledWith('tab1'); 
  });

  it('does not call undiscardTab when tab is clicked and eagerLoad is false but tab is not discarded', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString(), discarded: false, chromeTabId: 103 }
    ];
    render(<TabList groupId="g1" tabs={tabs} eagerLoad={false} />);
    fireEvent.click(screen.getByText('Tab A'));
    expect(undiscardTab).not.toHaveBeenCalled();
  });

  it('lazy-loads tabs (marks as discarded) when createTab is called and eagerLoad is false', async () => {
    // Mock getPreference to return false for eagerLoad via global mock
    (chrome.storage.local.get as vi.Mock).mockImplementationOnce((keys, callback) => {
      if (keys === 'atrium_eager_load') {
        callback({ atrium_eager_load: false });
      } else if (Array.isArray(keys)) {
        const result: { [key: string]: any } = {};
        keys.forEach(key => {
          result[key] = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : undefined;
        });
        callback(result);
      } else {
        callback({});
      }
    });

    const newTab = await createTab({
      url: 'https://new.com',
      title: 'New Tab',
      pinned: false,
      groupId: 'g1',
      favicon: '',
    });
    expect(newTab.discarded).toBe(true);
    expect(chrome.tabs.create).toHaveBeenCalledWith(expect.objectContaining({ discarded: true }));
  });

  it('eager-loads tabs (does not mark as discarded) when createTab is called and eagerLoad is true', async () => {
    // Mock getPreference to return true for eagerLoad via global mock
    (chrome.storage.local.get as vi.Mock).mockImplementationOnce((keys, callback) => {
      if (keys === 'atrium_eager_load') {
        callback({ atrium_eager_load: true });
      } else if (Array.isArray(keys)) {
        const result: { [key: string]: any } = {};
        keys.forEach(key => {
          result[key] = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : undefined;
        });
        callback(result);
      } else {
        callback({});
      }
    });

    const newTab = await createTab({
      url: 'https://eager.com',
      title: 'Eager Tab',
      pinned: false,
      groupId: 'g1',
      favicon: '',
    });
    expect(newTab.discarded).toBe(false);
    expect(chrome.tabs.create).toHaveBeenCalledWith(expect.objectContaining({ discarded: false }));
  });
});