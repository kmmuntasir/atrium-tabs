import { describe, it, expect, beforeEach } from 'vitest';
import {
  Tab,
  createTab,
  getTabs,
  getTab,
  updateTab,
  deleteTab,
  saveTabs
} from '../src/tab';

// Simple in-memory localStorage mock
globalThis.localStorage = {
  _data: {} as Record<string, string>,
  getItem(key: string) { return this._data[key] || null; },
  setItem(key: string, value: string) { this._data[key] = value; },
  removeItem(key: string) { delete this._data[key]; },
  clear() { this._data = {}; },
} as Storage;

function clearTabs() {
  saveTabs([]);
}

describe('Tab Model', () => {
  beforeEach(() => {
    clearTabs();
  });

  it('should create a tab with all required fields', () => {
    const tab = createTab({
      url: 'https://example.com',
      title: 'Example',
      pinned: false,
      groupId: 'group1',
      favicon: 'favicon.ico',
    });
    expect(tab.id).toBeDefined();
    expect(tab.url).toBe('https://example.com');
    expect(tab.title).toBe('Example');
    expect(tab.pinned).toBe(false);
    expect(tab.groupId).toBe('group1');
    expect(tab.favicon).toBe('favicon.ico');
    expect(tab.createdAt).toBeDefined();
  });

  it('should get, update, and delete a tab', () => {
    const tab = createTab({
      url: 'https://test.com',
      title: 'Test',
      pinned: true,
      groupId: 'group2',
      favicon: 'test.ico',
    });
    expect(getTab(tab.id)).toBeDefined();
    const updated = updateTab(tab.id, { title: 'Updated' });
    expect(updated?.title).toBe('Updated');
    expect(deleteTab(tab.id)).toBe(true);
    expect(getTab(tab.id)).toBeUndefined();
  });

  it('should persist and restore tabs', () => {
    const tab = createTab({
      url: 'https://persist.com',
      title: 'Persisted',
      pinned: false,
      groupId: 'group3',
      favicon: 'persist.ico',
    });
    // Simulate reload by reloading from localStorage
    const tabs = getTabs();
    expect(tabs.find(t => t.id === tab.id)).toBeDefined();
  });
});