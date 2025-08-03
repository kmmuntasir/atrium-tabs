import type { Tab } from '../types/Tab';

const STORAGE_KEY = 'atrium_tabs';

// Helper to save the entire tabs array to local storage
function saveAllTabs(tabs: Tab[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}

export class TabStorage {
  static createTab(tab: Tab): void {
    const tabs = TabStorage.getAllTabs();
    tabs.push(tab);
    saveAllTabs(tabs);
  }

  static getTab(uuid: string): Tab | undefined {
    const tabs = TabStorage.getAllTabs();
    return tabs.find(tab => tab.uuid === uuid);
  }

  static updateTab(updatedTab: Tab): void {
    let tabs = TabStorage.getAllTabs();
    tabs = tabs.map(tab => tab.uuid === updatedTab.uuid ? updatedTab : tab);
    saveAllTabs(tabs);
  }

  static deleteTab(uuid: string): void {
    let tabs = TabStorage.getAllTabs();
    tabs = tabs.filter(tab => tab.uuid !== uuid);
    saveAllTabs(tabs);
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