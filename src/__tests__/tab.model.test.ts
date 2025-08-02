import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTab, getTabs } from '../tab';

vi.mock('uuid', () => ({ v4: () => 'mock-uuid-5678' }));

// Mock the storage utility
vi.mock('../utils/storage', () => ({
  getPreference: vi.fn().mockResolvedValue(false), // Mock eagerLoad to false
}));

describe('Tab Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('should create a tab with valid URL, title, pinned, groupId, favicon, createdAt', async () => {
    const tab = await createTab({ url: 'https://example.com', title: 'Example', pinned: false, groupId: 'mock-group', favicon: 'icon.png' });
    expect(tab.url).toBe('https://example.com');
    expect(tab.title).toBe('Example');
    expect(tab.pinned).toBe(false);
    expect(tab.groupId).toBe('mock-group');
    expect(tab.favicon).toBe('icon.png');
    expect(tab.id).toBeDefined();
    expect(tab.createdAt).toBeDefined();
  });
  // ...more cases from test_cases/01_data_model.md
  it('should assign the new tab to the correct group and persist it', async () => {
    const groupId = 'group-123';
    const tab = await createTab({ url: 'https://test.com', title: 'Test Tab', pinned: false, groupId, favicon: 'test.png' });
    const tabs = getTabs();
    expect(tabs.some(t => t.id === tab.id && t.groupId === groupId)).toBe(true);
  });
});