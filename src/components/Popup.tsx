import React from 'react';
import GroupList from './GroupList';

export default function Popup() {
  return (
    <div style={{ width: 320, padding: 16 }}>
      <h2>Atrium Tabs</h2>
      <GroupList />
    </div>
  );
}