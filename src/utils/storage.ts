import { v4 as uuidv4 } from 'uuid';

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

export async function saveData(data: { [key: string]: any }) {
  return new Promise<void>(async (resolve, reject) => {
    if (chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse && chrome.storage.local.QUOTA_BYTES) {
      const { bytesInUse, quotaBytes } = await getStorageUsage();
      const newDataSizeEstimate = new TextEncoder().encode(JSON.stringify(data)).length;
      const estimatedTotalBytes = bytesInUse + newDataSizeEstimate;

      if (estimatedTotalBytes > quotaBytes) {
        return reject(new Error('STORAGE_QUOTA_EXCEEDED'));
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

export async function checkDataIntegrity(): Promise<boolean> {
  try {
    await getAllData(); // Attempt to retrieve all data
    // If getAllData resolves, it means the data is likely not corrupted in a way that prevents JSON parsing.
    // More sophisticated checks (e.g., schema validation) could be added here.
    return true;
  } catch (error) {
    console.error("Data integrity check failed:", error);
    return false;
  }
}