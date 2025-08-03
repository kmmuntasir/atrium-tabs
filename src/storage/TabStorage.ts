import type { Tab } from '../types/Tab';

export class TabStorage {
  private static readonly TAB_STORAGE_KEY = 'atrium_tabs';

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
    const tabs = TabStorage.getTabs();
    return tabs.filter(tab => tab.groupId === groupId);
  }
}