import { vi } from 'vitest';
// test/setup.ts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserver;

// Mock localStorage
defineGlobalLocalStorage();
function defineGlobalLocalStorage() {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
}

// --- Mock Chrome APIs ---
let mockChromeTabs: { [key: number]: chrome.tabs.Tab } = {};
let mockChromeWindows: { [key: number]: chrome.windows.Window } = {};
let mockLocalStorageData: { [key: string]: any } = {};

const resetChromeMocks = () => {
  mockChromeTabs = {};
  mockChromeWindows = { 
    1: { id: 1, focused: true, state: "normal", type: "normal" } // Default mock window
  };
  mockLocalStorageData = {};
};

beforeEach(() => {
  resetChromeMocks();
  vi.clearAllMocks();
});

(globalThis as any).chrome = {
  storage: {
    local: {
      get: vi.fn((keys, callback) => {
        let result: { [key: string]: any } = {};
        if (typeof keys === 'string') {
          result = { [keys]: mockLocalStorageData[keys] };
        } else if (Array.isArray(keys)) {
          keys.forEach(key => {
            result[key] = mockLocalStorageData[key];
          });
        } else { // No keys means get all
          result = { ...mockLocalStorageData };
        }
        callback?.(result);
      }),
      set: vi.fn((items, callback) => {
        for (const key in items) {
          mockLocalStorageData[key] = items[key];
        }
        callback?.();
      }),
      remove: vi.fn((keys, callback) => {
        const keysToRemove = Array.isArray(keys) ? keys : [keys];
        keysToRemove.forEach(key => delete mockLocalStorageData[key]);
        callback?.();
      }),
      getBytesInUse: vi.fn(() => 100), // Mock usage
      QUOTA_BYTES: 5 * 1024 * 1024, // 5MB
    }
  },
  runtime: {
    sendMessage: vi.fn(),
    getURL: vi.fn((path) => `chrome-extension://mock-id/${path}`),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    onStartup: {
      addListener: vi.fn(),
    },
    lastError: undefined,
    reload: vi.fn(), // Mock for chrome.runtime.reload
  },
  tabs: {
    create: vi.fn((createProperties) => {
      const mockId = Math.floor(Math.random() * 100000) + 1;
      const newTab: chrome.tabs.Tab = {
        id: mockId,
        windowId: createProperties.windowId || 1, // Default to window 1
        url: createProperties.url || 'about:blank',
        title: createProperties.title || 'Mock Tab',
        pinned: createProperties.pinned || false,
        active: createProperties.active || false,
        discarded: createProperties.discarded || false, // Ensure discarded property is set during creation
        index: Object.keys(mockChromeTabs).length, // Simple index
      };
      mockChromeTabs[mockId] = newTab;
      return Promise.resolve(newTab);
    }),
    remove: vi.fn((tabIds) => {
      const idsToRemove = Array.isArray(tabIds) ? tabIds : [tabIds];
      idsToRemove.forEach(id => delete mockChromeTabs[id]);
      return Promise.resolve();
    }),
    discard: vi.fn((tabIds) => {
      const idsToDiscard = Array.isArray(tabIds) ? tabIds : [tabIds];
      idsToDiscard.forEach(id => {
        if (mockChromeTabs[id]) {
          mockChromeTabs[id].discarded = true;
        }
      });
      return Promise.resolve();
    }),
    get: vi.fn((tabId) => {
      // Return a tab from mockChromeTabs, which is populated by create or pre-set for specific tests
      return Promise.resolve(mockChromeTabs[tabId]);
    }),
    update: vi.fn((tabId, updateProperties) => {
      if (mockChromeTabs[tabId]) {
        mockChromeTabs[tabId] = { ...mockChromeTabs[tabId], ...updateProperties };
        if (updateProperties.active) {
          mockChromeTabs[tabId].discarded = false; // Activating undiscard a tab
        }
      }
      return Promise.resolve(mockChromeTabs[tabId]);
    }),
    query: vi.fn((queryInfo) => {
      const filteredTabs = Object.values(mockChromeTabs).filter(tab => {
        let match = true;
        if (queryInfo.windowId !== undefined) match = match && tab.windowId === queryInfo.windowId;
        if (queryInfo.discarded !== undefined) match = match && tab.discarded === queryInfo.discarded;
        if (queryInfo.pinned !== undefined) match = match && tab.pinned === queryInfo.pinned;
        if (queryInfo.url) match = match && tab.url?.includes(queryInfo.url); 
        return match;
      });
      return Promise.resolve(filteredTabs);
    }),
  },
  commands: {
    getAll: vi.fn(),
  },
  alarms: {
    create: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
    get: vi.fn(),
  },
  windows: {
    getCurrent: vi.fn(() => Promise.resolve(mockChromeWindows[1])),
    // Add more window mocks if needed for multi-window scenarios
  },
};

// Mock chrome.storage.local.get for eagerLoad preference in tests
const storageLocalGetMock = chrome.storage.local.get as vi.Mock;
storageLocalGetMock.mockImplementation((keys, callback) => {
  if (keys === 'atrium_eager_load') {
    // Default to false (lazy load) unless explicitly set otherwise in a test
    callback({ atrium_eager_load: false });
  } else if (Array.isArray(keys)) {
    const result: { [key: string]: any } = {};
    keys.forEach(key => {
      result[key] = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : undefined;
    });
    callback(result);
  } else {
    callback({});
  }
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});