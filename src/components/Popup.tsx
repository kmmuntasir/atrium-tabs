import React from 'react';
import GroupList from './GroupList';
import toast from 'react-hot-toast';
import * as Button from '@radix-ui/react-button';

export default function Popup() {
  return (
    <div style={{ width: 320, padding: 16 }}>
      <h2>Atrium Tabs</h2>
      <Button.Root onClick={() => toast.success('Hello from Atrium Tabs!')}>Show Toast</Button.Root>
      <GroupList />
    </div>
  );
}