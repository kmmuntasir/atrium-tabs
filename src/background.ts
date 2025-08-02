import { sendGAEvent } from './utils/telemetry';
import { getAllData, checkDataIntegrity } from './utils/storage';

const ALARM_NAME = 'dailyHeartbeat';

async function handleDailyHeartbeat() {
  const allData = await getAllData();
  const groupCount = allData.groups.length;
  const tabCount = allData.tabs.length;

  sendGAEvent('heartbeat', {
    group_count: groupCount,
    tab_count: tabCount,
  });
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

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated.');
  runDataIntegrityCheck();
  chrome.alarms.create(ALARM_NAME, {
    when: Date.now() + 60000, // Trigger 1 minute after install/update
    periodInMinutes: 24 * 60, // Daily
  });
  // Send an initial heartbeat right away
  handleDailyHeartbeat();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    handleDailyHeartbeat();
  }
});

// Listen for browser startup to send heartbeat if alarm was missed or not yet scheduled
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started.');
  runDataIntegrityCheck();
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (!alarm) {
      console.log('Daily heartbeat alarm not found, creating it.');
      chrome.alarms.create(ALARM_NAME, {
        when: Date.now() + 60000, // Trigger 1 minute after startup
        periodInMinutes: 24 * 60,
      });
    }
    // Send heartbeat on startup regardless, as per PRD "First time the extension's background wakes up each calendar day."
    handleDailyHeartbeat();
  });
});