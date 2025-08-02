import { v4 as uuidv4 } from 'uuid';
import { Group } from '../group';
import { Tab } from '../tab';

export async function getAllData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([
      'atrium_groups',
      'atrium_tabs',
      'atrium_theme',
      'atrium_sort_order',
      'atrium_include_pinned_tabs',
      'atrium_hotkeys',
    ], (items) => {
      // If items is an error, reject
      if (
        items instanceof Error ||
        (items && typeof items === 'object' && 'message' in items)
      ) {
        reject(items);
        return;
      }
      resolve({
        groups: items.atrium_groups || [],
        tabs: items.atrium_tabs || [],
        preferences: {
          theme: items.atrium_theme || 'system',
          sortOrder: items.atrium_sort_order || 'alphabetical',
          includePinnedTabs: typeof items.atrium_include_pinned_tabs === 'boolean' ? items.atrium_include_pinned_tabs : false,
          hotkeys: items.atrium_hotkeys || {},
        },
      });
    });
  });
}

export async function getPreference<T>(key: string, defaultValue: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (items) => {
      resolve(items[key] !== undefined ? items[key] : defaultValue);
    });
  });
}

export async function saveData(data: { [key: string]: any }) {
  return new Promise<void>(async (resolve, reject) => {
    if (chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse && chrome.storage.local.QUOTA_BYTES) {
      const { bytesInUse, quotaBytes } = await getStorageUsage();
      const newDataSizeEstimate = new TextEncoder().encode(JSON.stringify(data)).length;
      const estimatedTotalBytes = bytesInUse + newDataSizeEstimate;

      const usagePercentage = (estimatedTotalBytes / quotaBytes) * 100;

      if (usagePercentage >= 100) {
        // Trigger a full storage modal/block save
        chrome.runtime.sendMessage({
          type: 'STORAGE_FULL',
          payload: {
            message: 'Storage full. Export or delete some groups before continuing.'
          }
        });
        return reject(new Error('STORAGE_QUOTA_EXCEEDED'));
      } else if (usagePercentage >= 90) {
        chrome.runtime.sendMessage({
          type: 'STORAGE_WARNING',
          payload: {
            message: 'Warning: Storage is nearly full (90%). Consider exporting or deleting some groups.',
            level: 'critical',
          },
        });
      } else if (usagePercentage >= 80) {
        chrome.runtime.sendMessage({
          type: 'STORAGE_WARNING',
          payload: {
            message: 'Warning: Storage is getting full (80%).',
            level: 'high',
          },
        });
      } else if (usagePercentage >= 50) {
        chrome.runtime.sendMessage({
          type: 'STORAGE_WARNING',
          payload: {
            message: 'Storage usage is at 50% capacity.',
            level: 'medium',
          },
        });
      }
    }

    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

export async function getStorageUsage(): Promise<{ bytesInUse: number; quotaBytes: number }> {
  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
      const quotaBytes = chrome.storage.local.QUOTA_BYTES;
      resolve({ bytesInUse, quotaBytes });
    });
  });
}

function isValidGroup(group: any): group is Group {
  return (
    typeof group === 'object' &&
    group !== null &&
    typeof group.id === 'string' &&
    typeof group.name === 'string' &&
    typeof group.createdAt === 'string' &&
    typeof group.updatedAt === 'string' &&
    typeof group.color === 'string' &&
    typeof group.icon === 'string' &&
    typeof group.order === 'number' &&
    typeof group.lastActiveAt === 'string'
  );
}

function isValidTab(tab: any): tab is Tab {
  return (
    typeof tab === 'object' &&
    tab !== null &&
    typeof tab.id === 'string' &&
    typeof tab.url === 'string' &&
    typeof tab.title === 'string' &&
    typeof tab.pinned === 'boolean' &&
    typeof tab.groupId === 'string' &&
    typeof tab.order === 'number' &&
    typeof tab.favicon === 'string' &&
    typeof tab.createdAt === 'string'
  );
}

export async function attemptAutoRepair(): Promise<void> {
  try {
    const data = await getAllData();

    const validGroups = data.groups.filter(isValidGroup);
    const validGroupIds = new Set(validGroups.map(group => group.id));
    const validTabs = data.tabs.filter(tab => isValidTab(tab) && validGroupIds.has(tab.groupId));

    await saveData({
      atrium_groups: validGroups,
      atrium_tabs: validTabs,
      atrium_theme: data.preferences.theme,
      atrium_sort_order: data.preferences.sortOrder,
      atrium_include_pinned_tabs: data.preferences.includePinnedTabs,
      atrium_hotkeys: data.preferences.hotkeys,
    });
    console.log("Auto-repair completed: Invalid data removed.");
  } catch (error) {
    console.error("Auto-repair failed:", error);
    throw error; // Re-throw to be caught by the caller if needed
  }
}

export async function checkDataIntegrity(): Promise<boolean> {
  try {
    const data = await getAllData();
    
    // Validate groups
    if (!Array.isArray(data.groups) || !data.groups.every(isValidGroup)) {
      console.error("Data integrity check failed: Invalid groups array or group schema.");
      return false;
    }

    // Validate tabs
    if (!Array.isArray(data.tabs) || !data.tabs.every(isValidTab)) {
      console.error("Data integrity check failed: Invalid tabs array or tab schema.");
      return false;
    }

    // Basic cross-validation: ensure all tabs reference existing groups
    const groupIds = new Set(data.groups.map(group => group.id));
    if (!data.tabs.every(tab => groupIds.has(tab.groupId))) {
      console.error("Data integrity check failed: Some tabs reference non-existent groups.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Data integrity check failed:", error);
    return false;
  }
}