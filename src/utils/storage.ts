import { v4 as uuidv4 } from 'uuid';

export async function getAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      resolve(items);
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