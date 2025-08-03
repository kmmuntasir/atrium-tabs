import { v4 as uuidv4 } from 'uuid';

export interface Group {
  id: string; // UUID
  name: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  icon: string;
  order: number;
  lastActiveAt: string; // ISO timestamp
  lastActiveTabId?: string; // ID of the last active tab in this group
  deleted?: boolean; // soft delete flag
  windowId?: number; // Chrome window ID if the group is currently active in a window
}

const GROUPS_KEY = 'atrium_groups';
const ACTIVE_GROUP_KEY = 'atrium_active_group_by_window'; // Stores { [windowId]: groupId }

export function getGroups(): Group[] {
  const data = localStorage.getItem(GROUPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveGroups(groups: Group[]): void {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Group {
  const now = new Date().toISOString();
  const newGroup: Group = {
    ...group,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    deleted: false,
  };
  const groups = getGroups();
  saveGroups([...groups, newGroup]);
  return newGroup;
}

export function updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'createdAt'>>): Group | null {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const updated = { ...groups[idx], ...updates, updatedAt: now };
  groups[idx] = updated;
  saveGroups(groups);
  return updated;
}

export function deleteGroup(id: string): boolean {
  const groups = getGroups();
  const filtered = groups.filter(g => g.id !== id);
  if (filtered.length === groups.length) return false;
  saveGroups(filtered);
  return true;
}

export function softDeleteGroup(id: string): boolean {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return false;
  groups[idx].deleted = true;
  groups[idx].updatedAt = new Date().toISOString();
  saveGroups(groups);
  return true;
}

export function restoreGroup(id: string): boolean {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return false;
  groups[idx].deleted = false;
  groups[idx].updatedAt = new Date().toISOString();
  saveGroups(groups);
  return true;
}

export function getGroup(id: string): Group | undefined {
  return getGroups().find(g => g.id === id);
}

export async function updateActiveGroup(newActiveGroupId: string, windowId: number, eagerLoad: boolean): Promise<void> {
  const allData = await chrome.storage.local.get([GROUPS_KEY, ACTIVE_GROUP_KEY]);
  const groups = allData[GROUPS_KEY] || [];
  const activeGroupsByWindow = allData[ACTIVE_GROUP_KEY] || {};
  const prevActiveGroupId = activeGroupsByWindow[windowId];

  // Deactivate previously active group in this window
  if (prevActiveGroupId && prevActiveGroupId !== newActiveGroupId) {
    await deactivateGroup(prevActiveGroupId, windowId, eagerLoad);
  }

  // Activate the new group
  await activateGroup(newActiveGroupId, windowId, eagerLoad);

  // Update active group for this window
  activeGroupsByWindow[windowId] = newActiveGroupId;
  await chrome.storage.local.set({ [ACTIVE_GROUP_KEY]: activeGroupsByWindow });
}

export async function activateGroup(groupId: string, windowId: number, eagerLoad: boolean, lastActiveTabId?: string): Promise<void> {
  const allData = await chrome.storage.local.get([GROUPS_KEY, 'atrium_tabs']);
  const groups = allData[GROUPS_KEY] || [];
  const tabs = allData.atrium_tabs || [];
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    console.warn(`Attempted to activate non-existent group: ${groupId}`);
    return;
  }

  // Update group's lastActiveAt and windowId
  group.lastActiveAt = new Date().toISOString();
  group.windowId = windowId; // Mark group as active in this window
  if (lastActiveTabId) {
    group.lastActiveTabId = lastActiveTabId;
  }
  saveGroups(groups);

  const groupTabs = tabs.filter(t => t.groupId === groupId);

  // Close all existing tabs in the current window first, if they don't belong to the new group
  const chromeTabsInWindow = await chrome.tabs.query({ windowId: windowId });
  const tabsToCloseInWindow = chromeTabsInWindow.filter(ct => {
    // Only close tabs that are not part of the new group and are not pinned (if pinned tabs are global)
    const correspondingAtriumTab = tabs.find(at => String(at.id) === String(ct.id));
    return correspondingAtriumTab && correspondingAtriumTab.groupId !== groupId && !correspondingAtriumTab.pinned; // Assuming pinned tabs are global or handled separately
  }).map(ct => ct.id!);

  if (tabsToCloseInWindow.length > 0) {
    await chrome.tabs.remove(tabsToCloseInWindow);
  }

  if (eagerLoad) {
    // If eagerLoad, ensure all tabs in this group are not discarded and open them
    for (const tab of groupTabs) {
      if (tab.discarded) {
        // If we had real Chrome Tab IDs, we'd undiscard them here. For now, just mark in model.
        tab.discarded = false;
      }
      // Open/create tab in Chrome if it doesn't exist in the current window
      const existingChromeTab = chromeTabsInWindow.find(ct => String(ct.id) === tab.id);
      if (!existingChromeTab) {
        await chrome.tabs.create({
          url: tab.url,
          pinned: tab.pinned,
          active: tab.id === group.lastActiveTabId, // Activate the last active tab
          windowId: windowId
        });
      }
    }
  } else {
    // If lazyLoad (default), create tabs as discarded, except the last active one
    const lastActiveTab = groupTabs.find(t => t.id === group.lastActiveTabId);
    const tabsToCreateDiscarded = groupTabs.filter(t => t.id !== lastActiveTab?.id);

    for (const tab of tabsToCreateDiscarded) {
      // Mark as discarded in our model
      tab.discarded = true;
      // Create discarded tab in Chrome
      await chrome.tabs.create({
        url: tab.url,
        pinned: tab.pinned,
        active: false, // Discarded tabs are not active initially
        windowId: windowId, 
        discarded: true // This property might not be directly supported by create, but we can set it via update later if needed
      });
    }

    // Open the last active tab normally
    if (lastActiveTab) {
      await chrome.tabs.create({
        url: lastActiveTab.url,
        pinned: lastActiveTab.pinned,
        active: true,
        windowId: windowId
      });
    }
  }
}

export async function deactivateGroup(groupId: string, windowId: number, eagerLoad: boolean): Promise<void> {
  const allData = await chrome.storage.local.get([GROUPS_KEY, 'atrium_tabs']);
  const groups = allData[GROUPS_KEY] || [];
  const tabs = allData.atrium_tabs || [];
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    console.warn(`Attempted to deactivate non-existent group: ${groupId}`);
    return;
  }

  // Clear windowId from group
  group.windowId = undefined;
  saveGroups(groups);

  const groupTabs = tabs.filter(t => t.groupId === groupId);

  if (!eagerLoad) {
    // If lazyLoad, discard all tabs in this group that are currently open in the deactivated window
    const chromeTabsInWindow = await chrome.tabs.query({ windowId: windowId });
    const tabIdsToDiscard = chromeTabsInWindow.filter(ct => groupTabs.some(gt => String(gt.id) === String(ct.id))).map(ct => ct.id!); // Assuming internal tab ID matches Chrome tab ID for simplicity
    if (tabIdsToDiscard.length > 0) {
      // Mark as discarded in our model
      for (const tab of groupTabs) {
        if (tabIdsToDiscard.includes(parseInt(tab.id))) {
          tab.discarded = true;
        }
      }
      // Discard in Chrome
      await chrome.tabs.discard(tabIdsToDiscard);
    }
  }

  // Close all tabs that belong to this group in the current window (unless eagerLoad is true, then they remain)
  if (!eagerLoad) {
    const chromeTabs = await chrome.tabs.query({ windowId: windowId });
    const tabsToClose = chromeTabs.filter(ct => groupTabs.some(t => t.id === String(ct.id))).map(ct => ct.id!);
    if (tabsToClose.length > 0) {
      await chrome.tabs.remove(tabsToClose);
    }
  }
}