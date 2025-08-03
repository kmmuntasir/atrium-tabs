import type { Tab } from '../types/Tab';

const STORAGE_KEY = 'atrium_tabs';

// Helper to save the entire tabs array to local storage
function saveAllTabs(tabs: Tab[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}

export class TabStorage {
  private static getTabs(): Tab[] {
    // For the purpose of ATRIUM-0012, this is simplified to a synchronous mock.
    // In a real scenario, this would involve async storage operations.
    return JSON.parse(localStorage.getItem(TabStorage.TAB_STORAGE_KEY) || '[]');
  }

  private static saveTabs(tabs: Tab[]): void {
    // For the purpose of ATRIUM-0012, this is simplified to a synchronous mock.
    // In a real scenario, this would involve async storage operations.
    localStorage.setItem(TabStorage.TAB_STORAGE_KEY, JSON.stringify(tabs));
  }

  static createTab(tab: Tab): void {
    const tabs = TabStorage.getTabs();
    tabs.push(tab);
    TabStorage.saveTabs(tabs);
  }

  static getTab(id: string): Tab | undefined {
    const tabs = TabStorage.getTabs();
    return tabs.find(tab => tab.id === id);
  }

  static updateTab(updatedTab: Tab): void {
    let tabs = TabStorage.getTabs();
    tabs = tabs.map(tab => tab.id === updatedTab.id ? updatedTab : tab);
    TabStorage.saveTabs(tabs);
  }

  static deleteTab(id: string): void {
    let tabs = TabStorage.getTabs();
    tabs = tabs.filter(tab => tab.id !== id);
    TabStorage.saveTabs(tabs);
  }

  static getTabsByGroupId(groupId: string): Tab[] {
    const tabsJson = localStorage.getItem(STORAGE_KEY);
    const allTabs: Tab[] = tabsJson ? JSON.parse(tabsJson) : [];
    return allTabs.filter(tab => tab.groupId === groupId);
  }

  static saveTabs(tabsToSave: Tab[]): void {
    let allTabs = TabStorage.getAllTabs();
    // Remove existing tabs with the same UUIDs as tabsToSave to avoid duplicates
    const uuidsToSave = new Set(tabsToSave.map(tab => tab.uuid));
    allTabs = allTabs.filter(tab => !uuidsToSave.has(tab.uuid));
    // Add the new/updated tabs
    allTabs.push(...tabsToSave);
    saveAllTabs(allTabs);
  }

  static getAllTabs(): Tab[] {
    const tabsJson = localStorage.getItem(STORAGE_KEY);
    return tabsJson ? JSON.parse(tabsJson) : [];
  }
}