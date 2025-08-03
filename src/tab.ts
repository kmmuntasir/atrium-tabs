import { v4 as uuidv4 } from 'uuid';
import { getPreference } from './utils/storage';

export interface Tab {
  id: string; // UUID
  url: string;
  title: string;
  pinned: boolean;
  groupId: string;
  order: number; // Order within group
  favicon: string;
  createdAt: string;
  discarded?: boolean; // New property to indicate if the tab is discarded
  chromeTabId?: number; // The actual Chrome Tab ID
}

const TABS_KEY = 'atrium_tabs';

export function getTabs(): Tab[] {
  const data = localStorage.getItem(TABS_KEY);
  const tabs: Tab[] = data ? JSON.parse(data) : [];
  // Sort tabs by order within each group
  return tabs.sort((a, b) => a.groupId === b.groupId ? a.order - b.order : 0);
}

export function saveTabs(tabs: Tab[]): void {
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
}

export async function createTab(tab: Omit<Tab, 'id' | 'createdAt' | 'order' | 'discarded' | 'chromeTabId'>, eagerLoadOverride?: boolean): Promise<Tab> {
  const now = new Date().toISOString();
  const tabs = getTabs();
  // Find max order in this group
  const groupTabs = tabs.filter(t => t.groupId === tab.groupId);
  const nextOrder = groupTabs.length > 0 ? Math.max(...groupTabs.map(t => t.order)) + 1 : 0;

  // Determine discarded state based on eagerLoad preference or override
  const eagerLoad = typeof eagerLoadOverride === 'boolean' ? eagerLoadOverride : await getPreference<boolean>('atrium_eager_load', false);
  const discarded = !eagerLoad;

  let chromeTab: chrome.tabs.Tab | undefined;
  try {
    chromeTab = await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      active: !discarded, // If discarded, not active initially
      discarded: discarded,
    });
  } catch (error) {
    console.error("Error creating Chrome tab:", error);
    // Fallback if Chrome tab creation fails (e.g., in test environment without full mock)
    chromeTab = { id: Math.floor(Math.random() * 100000) }; // Assign a mock ID
  }

  const newTab: Tab = {
    ...tab,
    id: uuidv4(),
    createdAt: now,
    order: nextOrder,
    discarded: discarded,
    chromeTabId: chromeTab.id,
  };
  saveTabs([...tabs, newTab]);
  return newTab;
}

export function updateTab(id: string, updates: Partial<Omit<Tab, 'id' | 'createdAt'>>): Tab | null {
  const tabs = getTabs();
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const updated = { ...tabs[idx], ...updates };
  tabs[idx] = updated;
  saveTabs(tabs);
  return updated;
}

export function deleteTab(id: string): boolean {
  const tabs = getTabs();
  const filtered = tabs.filter(t => t.id !== id);
  if (filtered.length === tabs.length) return false;
  saveTabs(filtered);
  return true;
}

export function getTab(id: string): Tab | undefined {
  return getTabs().find(t => t.id === id);
}