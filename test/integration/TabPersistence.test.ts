import { Tab } from '../../src/types/Tab';
import { TabStorage } from '../../src/storage/TabStorage';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Tab Persistence Integration Tests', () => {
  const TEST_TAB: Tab = {
    id: 'test-tab-1',
    groupId: 'test-group-1',
    url: 'https://test.com',
    title: 'Test Tab',
    pinned: false,
    favicon: 'https://test.com/favicon.ico',
    createdAt: Date.now(),
  };

  // Mock chrome.storage.local
  const mockStorage: { [key: string]: any } = {};
  global.chrome = {
    storage: {
      local: {
        get: vi.fn(async (key: string) => {
          return { [key]: mockStorage[key] };
        }),
        set: vi.fn(async (items: { [key: string]: any }) => {
          Object.assign(mockStorage, items);
        }),
        remove: vi.fn(async (key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(async () => {
          for (const key in mockStorage) {
            delete mockStorage[key];
          }
        }),
      },
    },
  } as any;

  afterEach(async () => {
    // Clear mock storage after each test
    await chrome.storage.local.clear();
  });

  it('should persist tabs in local storage and retrieve them after reload', async () => {
    // Create a tab
    await TabStorage.createTab(TEST_TAB);

    // Simulate browser reload by re-initializing TabStorage (though not strictly necessary for local storage)
    // In a real scenario, the extension might reload and re-instantiate storage classes.

    // Retrieve tabs and check if the created tab exists
    const retrievedTab = await TabStorage.getTab(TEST_TAB.id);
    expect(retrievedTab).toEqual(TEST_TAB);

    // Verify direct storage content
    const data = await chrome.storage.local.get(TabStorage['TAB_STORAGE_KEY']);
    expect(data[TabStorage['TAB_STORAGE_KEY']]).toEqual([TEST_TAB]);
  });

  it('should correctly handle multiple tabs across reloads', async () => {
    const tab1: Tab = {
      id: 'tab-A',
      groupId: 'group-X',
      url: 'https://taba.com',
      title: 'Tab A',
      pinned: false,
      favicon: '',
      createdAt: Date.now(),
    };
    const tab2: Tab = {
      id: 'tab-B',
      groupId: 'group-X',
      url: 'https://tabb.com',
      title: 'Tab B',
      pinned: false,
      favicon: '',
      createdAt: Date.now() + 1,
    };

    await TabStorage.createTab(tab1);
    await TabStorage.createTab(tab2);

    const allTabs = await TabStorage['getTabs'](); // Access private method for testing direct content
    expect(allTabs).toEqual([tab1, tab2]);

    const retrievedTab1 = await TabStorage.getTab(tab1.id);
    const retrievedTab2 = await TabStorage.getTab(tab2.id);

    expect(retrievedTab1).toEqual(tab1);
    expect(retrievedTab2).toEqual(tab2);
  });

  it('should persist deletion of a tab', async () => {
    await TabStorage.createTab(TEST_TAB);
    await TabStorage.deleteTab(TEST_TAB.id);

    const retrievedTab = await TabStorage.getTab(TEST_TAB.id);
    expect(retrievedTab).toBeUndefined();

    const data = await chrome.storage.local.get(TabStorage['TAB_STORAGE_KEY']);
    expect(data[TabStorage['TAB_STORAGE_KEY']]).toEqual([]);
  });

  it('should persist updates to a tab', async () => {
    await TabStorage.createTab(TEST_TAB);
    const updatedTitle = 'Updated Test Tab';
    const updatedTab = { ...TEST_TAB, title: updatedTitle };

    await TabStorage.updateTab(updatedTab);

    const retrievedTab = await TabStorage.getTab(TEST_TAB.id);
    expect(retrievedTab?.title).toBe(updatedTitle);

    const data = await chrome.storage.local.get(TabStorage['TAB_STORAGE_KEY']);
    expect(data[TabStorage['TAB_STORAGE_KEY']]).toEqual([updatedTab]);
  });
});