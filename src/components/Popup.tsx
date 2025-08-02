import React from 'react';
import GroupList from './GroupList';
import toast from 'react-hot-toast';

export default function Popup() {
  return (
    <div style={{ width: 320, padding: 16 }}>
      <h2>Atrium Tabs</h2>
      <button onClick={() => toast.success('Hello from Atrium Tabs!')}>Show Toast</button>
      <GroupList />
    </div>
  );
}