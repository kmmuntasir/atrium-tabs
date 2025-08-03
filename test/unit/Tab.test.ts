import { Tab } from '../../src/types/Tab';
import { TabStorage } from '../../src/storage/TabStorage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('TabStorage Unit Tests', () => {
  const MOCK_TABS: Tab[] = [
    {
      id: 'tab-1',
      groupId: 'group-1',
      url: 'https://example.com/1',
      title: 'Example Tab 1',
      pinned: false,
      favicon: 'https://example.com/favicon1.ico',
      createdAt: 1678886400000,
    },
    {
      id: 'tab-2',
      groupId: 'group-1',
      url: 'https://example.com/2',
      title: 'Example Tab 2',
      pinned: true,
      favicon: 'https://example.com/favicon2.ico',
      createdAt: 1678886460000,
    },
    {
      id: 'tab-3',
      groupId: 'group-2',
      url: 'https://example.com/3',
      title: 'Example Tab 3',
      pinned: false,
      favicon: 'https://example.com/favicon3.ico',
      createdAt: 1678886520000,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock chrome.storage.local for unit tests
    global.chrome = {
      storage: {
        local: {
          get: vi.fn(async (key: string) => {
            if (key === TabStorage['TAB_STORAGE_KEY']) {
              return { [TabStorage['TAB_STORAGE_KEY']]: [] };
            }
            return {};
          }),
          set: vi.fn(async () => { }),
        },
      },
    } as any;
  });

  it('should create a new tab', async () => {
    const newTab: Tab = {
      id: 'tab-4',
      groupId: 'group-1',
      url: 'https://example.com/4',
      title: 'Example Tab 4',
      pinned: false,
      favicon: 'https://example.com/favicon4.ico',
      createdAt: Date.now(),
    };
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: [] });

    await TabStorage.createTab(newTab);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [TabStorage['TAB_STORAGE_KEY']]: [newTab],
    });
  });

  it('should get a tab by its ID', async () => {
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: MOCK_TABS });
    const tab = await TabStorage.getTab('tab-1');
    expect(tab).toEqual(MOCK_TABS[0]);
  });

  it('should return undefined if tab not found', async () => {
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: MOCK_TABS });
    const tab = await TabStorage.getTab('non-existent-tab');
    expect(tab).toBeUndefined();
  });

  it('should update an existing tab', async () => {
    const updatedTab = { ...MOCK_TABS[0], title: 'Updated Tab 1' };
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: MOCK_TABS });

    await TabStorage.updateTab(updatedTab);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [TabStorage['TAB_STORAGE_KEY']]: [updatedTab, MOCK_TABS[1], MOCK_TABS[2]],
    });
  });

  it('should delete a tab by its ID', async () => {
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: MOCK_TABS });

    await TabStorage.deleteTab('tab-1');

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [TabStorage['TAB_STORAGE_KEY']]: [MOCK_TABS[1], MOCK_TABS[2]],
    });
  });

  it('should get tabs by group ID', async () => {
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: MOCK_TABS });
    const tabs = await TabStorage.getTabsByGroupId('group-1');
    expect(tabs).toEqual([MOCK_TABS[0], MOCK_TABS[1]]);
  });

  it('should return empty array if no tabs for group ID', async () => {
    (chrome.storage.local.get as vi.Mock).mockResolvedValueOnce({ [TabStorage['TAB_STORAGE_KEY']]: MOCK_TABS });
    const tabs = await TabStorage.getTabsByGroupId('non-existent-group');
    expect(tabs).toEqual([]);
  });
});