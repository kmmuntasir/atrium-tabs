import { Tab } from '../types/Tab';

export class TabStorage {
  private static readonly TAB_STORAGE_KEY = 'atrium_tabs';

  private static async getTabs(): Promise<Tab[]> {
    const data = await chrome.storage.local.get(TabStorage.TAB_STORAGE_KEY);
    return data[TabStorage.TAB_STORAGE_KEY] || [];
  }

  private static async saveTabs(tabs: Tab[]): Promise<void> {
    await chrome.storage.local.set({ [TabStorage.TAB_STORAGE_KEY]: tabs });
  }

  static async createTab(tab: Tab): Promise<void> {
    const tabs = await TabStorage.getTabs();
    tabs.push(tab);
    await TabStorage.saveTabs(tabs);
  }

  static async getTab(id: string): Promise<Tab | undefined> {
    const tabs = await TabStorage.getTabs();
    return tabs.find(tab => tab.id === id);
  }

  static async updateTab(updatedTab: Tab): Promise<void> {
    let tabs = await TabStorage.getTabs();
    tabs = tabs.map(tab => tab.id === updatedTab.id ? updatedTab : tab);
    await TabStorage.saveTabs(tabs);
  }

  static async deleteTab(id: string): Promise<void> {
    let tabs = await TabStorage.getTabs();
    tabs = tabs.filter(tab => tab.id !== id);
    await TabStorage.saveTabs(tabs);
  }

  static async getTabsByGroupId(groupId: string): Promise<Tab[]> {
    const tabs = await TabStorage.getTabs();
    return tabs.filter(tab => tab.groupId === groupId);
  }
}