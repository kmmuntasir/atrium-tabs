import React from 'react';
import ReactDOM from 'react-dom/client';
import Settings from './components/Settings';
import './index.css';
import { createGroup } from './group';
import { getAllData } from './utils/storage';
import { sendGAEvent } from './utils/telemetry';

async function initializeApp() {
  const { first_run_completed } = await chrome.storage.local.get('first_run_completed');
  let initialTab = 'general';

  if (!first_run_completed) {
    console.log('First run detected. Initializing onboarding.');
    await chrome.storage.local.set({ first_run_completed: true });
    initialTab = 'welcome-tour';

    // Save current window as new group named "New Group 0"
    try {
      const allData = await getAllData();
      createGroup({
        name: 'New Group 0',
        color: '#1976d2', // default blue
        icon: 'folder', // default icon
        order: allData.groups.length,
        lastActiveAt: new Date().toISOString(),
      });
      sendGAEvent('first_run_group_created');
      console.log('"New Group 0" created on first run.');
    } catch (error) {
      console.error('Error creating "New Group 0" on first run:', error);
      sendGAEvent('first_run_group_creation_failed', { error: error.message });
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Settings initialActiveTab={initialTab} />
    </React.StrictMode>
  );
}

initializeApp();