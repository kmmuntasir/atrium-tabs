import React from 'react';
import { Tab, getTabs } from '../tab';

interface TabListProps {
  groupId: string;
}

export default function TabList({ groupId }: TabListProps) {
  const tabs: Tab[] = getTabs().filter(tab => tab.groupId === groupId);

  const handleOpenNewTab = () => {
    // In a real extension, would use chrome.tabs.create
    alert('Would open a new tab in this group (mock)');
  };

  return (
    <ul style={{ listStyle: 'none', paddingLeft: 20, marginTop: 8 }}>
      {tabs.length === 0 && (
        <li style={{ fontSize: '0.8em', color: '#666' }}>
          No tabs in this group.
          <button style={{ marginLeft: 8 }} onClick={handleOpenNewTab}>Open New Tab</button>
        </li>
      )}
      {tabs.map(tab => (
        <li key={tab.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <img src={tab.favicon || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='} alt="favicon" style={{ width: 16, height: 16, marginRight: 8 }} />
          <span style={{ fontSize: '0.9em' }}>{tab.title || tab.url}</span>
        </li>
      ))}
    </ul>
  );
}