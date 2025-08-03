import { v4 as uuidv4 } from 'uuid';

const API_SECRET = 'YOUR_API_SECRET'; // TODO: Replace with your GA4 API Secret
const MEASUREMENT_ID = 'YOUR_MEASUREMENT_ID'; // TODO: Replace with your GA4 Measurement ID
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

// In-memory rate limiting for telemetry events (resets on extension reload/browser restart)
// This is now only for temporary storage within a session. Persistent rate limiting is handled via chrome.storage.local
const telemetryEventCounts: { [eventName: string]: number } = {};
const MAX_TOTAL_EVENTS_PER_DAY = 3;

interface DailyTelemetryStats {
  eventsSentToday: number;
  lastResetDate: string;
}

async function getDailyTelemetryStats(): Promise<DailyTelemetryStats> {
  const { dailyTelemetryStats } = await chrome.storage.local.get('dailyTelemetryStats');
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (!dailyTelemetryStats || dailyTelemetryStats.lastResetDate !== today) {
    return { eventsSentToday: 0, lastResetDate: today };
  }
  return dailyTelemetryStats;
}

async function setDailyTelemetryStats(stats: DailyTelemetryStats) {
  await chrome.storage.local.set({ dailyTelemetryStats: stats });
}

async function isTelemetryOptedIn(): Promise<boolean> {
  const { telemetry_opt_in } = await chrome.storage.local.get('telemetry_opt_in');
  return telemetry_opt_in === true; // Default to false if not set
}

async function getEnvironmentInfo() {
  const browserInfo = navigator.userAgent;
  const osInfo = navigator.platform;
  const appVersion = chrome.runtime.getManifest().version;

  return {
    browser: browserInfo,
    os: osInfo,
    extension_version: appVersion,
  };
}

export async function sendGAEvent(eventName: string, eventParams: Record<string, any> = {}) {
  const optedIn = await isTelemetryOptedIn();
  if (!optedIn) {
    console.log(`Telemetry not opted in. Event '${eventName}' not sent.`);
    return;
  }

  let dailyStats = await getDailyTelemetryStats();

  if (dailyStats.eventsSentToday >= MAX_TOTAL_EVENTS_PER_DAY) {
    console.warn(`Daily rate limit exceeded. Event '${eventName}' not sent.`);
    return;
  }

  // Increment count and update storage
  dailyStats.eventsSentToday++;
  await setDailyTelemetryStats(dailyStats);

  const user_pseudo_id = await getOrCreateUserPseudoId();
  const session_id = Date.now().toString(); // Simple session ID for now

  // Filter out sensitive data as per PRD: no URLs/hostnames, no user identifiers
  const filteredEventParams = { ...eventParams };
  if (filteredEventParams.url) {
    delete filteredEventParams.url;
  }
  if (filteredEventParams.username) {
    delete filteredEventParams.username;
  }
  // Add more sensitive data filters as needed based on PRD

  try {
    const response = await fetch(GA4_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: user_pseudo_id,
        events: [
          {
            name: eventName,
            params: {
              ...filteredEventParams,
              session_id: session_id,
              engagement_time_msec: 100, // Placeholder
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send GA event ${eventName}:`, response.status, response.statusText);
    } else {
      console.log(`GA event '${eventName}' sent successfully. Daily count: ${dailyStats.eventsSentToday}/${MAX_TOTAL_EVENTS_PER_DAY}`);
    }
  } catch (error) {
    console.error(`Error sending GA event '${eventName}':`, error);
  }
}

export async function sendCrashReport(error: Error, additionalInfo: Record<string, any> = {}) {
  const envInfo = await getEnvironmentInfo();
  await sendGAEvent('crash_report', {
    error_name: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    ...envInfo,
    ...additionalInfo,
  });
}

export async function sendErrorLog(error: Error, additionalInfo: Record<string, any> = {}) {
  const envInfo = await getEnvironmentInfo();
  await sendGAEvent('error_log', {
    error_name: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    ...envInfo,
    ...additionalInfo,
  });
}

export async function sendHeartbeat(groupCount: number, tabCount: number) {
  await sendGAEvent('heartbeat', {
    group_count: groupCount,
    tab_count: tabCount,
  });
}


async function getOrCreateUserPseudoId(): Promise<string> {
  let { user_pseudo_id } = await chrome.storage.local.get('user_pseudo_id');
  if (!user_pseudo_id) {
    user_pseudo_id = uuidv4();
    await chrome.storage.local.set({ user_pseudo_id });
  }
  return user_pseudo_id;
}

// Example usage:
// sendGAEvent('extension_installed', { version: chrome.runtime.getManifest().version });
// sendGAEvent('group_created', { group_name: 'My New Group' });