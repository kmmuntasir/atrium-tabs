import { v4 as uuidv4 } from 'uuid';

export interface Tab {
  id: string; // UUID
  url: string;
  title: string;
  pinned: boolean;
  groupId: string;
  favicon: string;
  createdAt: string;
}

const TABS_KEY = 'atrium_tabs';

export function getTabs(): Tab[] {
  const data = localStorage.getItem(TABS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTabs(tabs: Tab[]): void {
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
}

export function createTab(tab: Omit<Tab, 'id' | 'createdAt'>): Tab {
  const now = new Date().toISOString();
  const newTab: Tab = {
    ...tab,
    id: uuidv4(),
    createdAt: now,
  };
  const tabs = getTabs();
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