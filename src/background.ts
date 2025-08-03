import { sendHeartbeat } from './utils/telemetry';
import { getAllData, checkDataIntegrity, saveData } from './utils/storage';
import { createGroup } from './group';
import { getTabs } from './tab'; // Import getTabs
import { getPreference } from './utils/preferences';

const ALARM_NAME = 'dailyHeartbeat';

async function handleDailyHeartbeat() {
  const allData = await getAllData();
  const groupCount = allData.groups.length;
  const tabCount = allData.tabs.length;

  await sendHeartbeat(groupCount, tabCount);
  console.log('Daily heartbeat sent.', { groupCount, tabCount });
}

async function runDataIntegrityCheck() {
  const isDataSane = await checkDataIntegrity();
  if (!isDataSane) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'DATA_CORRUPTION' });
      }
    });
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed or updated.');
  runDataIntegrityCheck();

  if (details.reason === 'install') {
    console.log('First install: Creating "New Group 0" and saving current window.');
    const now = new Date().toISOString();
    const currentWindow = await chrome.windows.getCurrent({ populate: true });
    const currentTabs = currentWindow.tabs || [];

    const newGroup = createGroup({
      name: `Window - ${new Date().toLocaleString()}`,
      // Assign a default color/icon if needed, based on PRD
      // For MVP, just saving name and tabs
    });

    const tabsToSave = await Promise.all(currentTabs.map(async tab => ({
      id: String(tab.id),
      url: tab.url || '',
      title: tab.title || '',
      pinned: tab.pinned || false,
      groupId: newGroup.id,
      order: tab.index || 0,
      favicon: tab.favIconUrl || '',
      createdAt: now,
      discarded: !(await getPreference<boolean>('atrium_eager_load', false)), // Set discarded based on preference
      chromeTabId: tab.id, // Store the actual Chrome tab ID
    })));

    // Get existing data, add new group and tabs, then save
    const existingData = await getAllData();
    existingData.groups.push(newGroup);
    existingData.tabs.push(...tabsToSave);
    await saveData(existingData);

    // Mark has_run_before so settings page knows not to open tour tab again
    await chrome.storage.local.set({ has_run_before: true });

    // Open settings page to welcome tour tab
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html?tab=welcome-tour') });
  }

  chrome.alarms.create(ALARM_NAME, {
    when: Date.now() + 60000, // Trigger 1 minute after install/update
    periodInMinutes: 24 * 60, // Daily
  });
  // Send an initial heartbeat right away
  await handleDailyHeartbeat();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    handleDailyHeartbeat();
  }
});

// Listen for browser startup to send heartbeat if alarm was missed or not yet scheduled
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started.');
  runDataIntegrityCheck();
  chrome.alarms.get(ALARM_NAME, async (alarm) => {
    if (!alarm) {
      console.log('Daily heartbeat alarm not found, creating it.');
      chrome.alarms.create(ALARM_NAME, {
        when: Date.now() + 60000, // Trigger 1 minute after startup
        periodInMinutes: 24 * 60,
      });
    }
    // Send heartbeat on startup regardless, as per PRD "First time the extension's background wakes up each calendar day."
    await handleDailyHeartbeat();
  });
});

export async function discardTabs(tabIds: number[]) {
  if (chrome.tabs && chrome.tabs.discard) {
    await chrome.tabs.discard(tabIds);
    console.log('Discarded tabs:', tabIds);
  }
}

export async function undiscardTab(internalTabId: string) {
  const allTabs = getTabs(); // Retrieve all tabs
  const tabToUndiscard = allTabs.find(t => t.id === internalTabId);

  if (tabToUndiscard && tabToUndiscard.chromeTabId) {
    if (chrome.tabs && chrome.tabs.get) {
      const tab = await chrome.tabs.get(tabToUndiscard.chromeTabId);
      if (tab && tab.discarded) {
        await chrome.tabs.update(tabToUndiscard.chromeTabId, { active: true });
        console.log('Undiscarded tab:', tabToUndiscard.chromeTabId);
      }
    }
  }
}