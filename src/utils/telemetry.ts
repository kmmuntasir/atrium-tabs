import { v4 as uuidv4 } from 'uuid';

const API_SECRET = 'YOUR_API_SECRET'; // Replace with your GA4 API Secret
const MEASUREMENT_ID = 'YOUR_MEASUREMENT_ID'; // Replace with your GA4 Measurement ID
const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

// In-memory rate limiting for telemetry events (resets on extension reload/browser restart)
const telemetryEventCounts: { [eventName: string]: number } = {};
const MAX_EVENTS_PER_DAY = 3;
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

// Reset counts daily (simple simulation for now)
setInterval(() => {
  for (const eventName in telemetryEventCounts) {
    telemetryEventCounts[eventName] = 0;
  }
}, TWENTY_FOUR_HOURS_IN_MS);

async function getOrCreateUserPseudoId(): Promise<string> {
  let { user_pseudo_id } = await chrome.storage.local.get('user_pseudo_id');
  if (!user_pseudo_id) {
    user_pseudo_id = uuidv4();
    await chrome.storage.local.set({ user_pseudo_id });
  }
  return user_pseudo_id;
}

async function isTelemetryOptedIn(): Promise<boolean> {
  const { telemetry_opt_in } = await chrome.storage.local.get('telemetry_opt_in');
  return telemetry_opt_in === true; // Default to false if not set
}

async function getEnvironmentInfo() {
  // This is a simplified version; in a real extension, you'd get more detailed info
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

  // Apply rate limiting
  telemetryEventCounts[eventName] = (telemetryEventCounts[eventName] || 0) + 1;
  if (telemetryEventCounts[eventName] > MAX_EVENTS_PER_DAY) {
    console.warn(`Rate limit exceeded for event '${eventName}'. Not sending.`);
    return;
  }

  const user_pseudo_id = await getOrCreateUserPseudoId();
  const session_id = Date.now().toString(); // Simple session ID for now

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
              ...eventParams,
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
      console.log(`GA event '${eventName}' sent successfully.`);
    }
  } catch (error) {
    console.error(`Error sending GA event '${eventName}':`, error);
  }
}

export async function sendCrashReport(error: Error, additionalInfo: Record<string, any> = {}) {
  const envInfo = await getEnvironmentInfo();
  sendGAEvent('crash_report', {
    error_name: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    ...envInfo,
    ...additionalInfo,
  });
}

export async function sendErrorLog(error: Error, additionalInfo: Record<string, any> = {}) {
  const envInfo = await getEnvironmentInfo();
  sendGAEvent('error_log', {
    error_name: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    ...envInfo,
    ...additionalInfo,
  });
}

// Example usage:
// sendGAEvent('extension_installed', { version: chrome.runtime.getManifest().version });
// sendGAEvent('group_created', { group_name: 'My New Group' });