import React from 'react';
import { getGroups, Group } from '../group';
import { getTabs } from '../tab';

function LockIcon() {
  return <span title="Active elsewhere" style={{ marginLeft: 8 }}>🔒</span>;
}

export default function GroupList() {
  const groups: Group[] = getGroups();
  const tabs = getTabs();

  // For demo, mock group 2 as active elsewhere
  const activeElsewhereId = groups[1]?.id;

  return (
    <ul>
      {groups.length === 0 && <li>No groups found.</li>}
      {groups.map(group => (
        <li key={group.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>{group.icon || '📁'}</span>
          <span style={{ flex: 1 }}>{group.name}</span>
          <span style={{ marginRight: 8 }}>({tabs.filter(t => t.groupId === group.id).length})</span>
          {group.id === activeElsewhereId && <LockIcon />}
        </li>
      ))}
    </ul>
  );
}