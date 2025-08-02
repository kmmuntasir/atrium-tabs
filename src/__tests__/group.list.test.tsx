import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import GroupList from '../components/GroupList';
import * as Tooltip from '@radix-ui/react-tooltip';

// Mock localStorage for test isolation
beforeEach(() => {
  window.localStorage.clear();
});

describe('GroupList', () => {
  it('auto-creates a tab when switching to an empty group', async () => {
    // Setup: two groups, one with no tabs
    window.localStorage.setItem('atrium_groups', JSON.stringify([
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'g2', name: 'Group 2', color: '#388e3c', icon: 'folder', order: 1, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]));
    window.localStorage.setItem('atrium_tabs', JSON.stringify([
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 }
    ]));
    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Switch to group 2 (empty)
    fireEvent.change(screen.getByLabelText(/active group/i), { target: { value: 'g2' } });
    // Expand group 2 accordion
    fireEvent.click(screen.getAllByText('Group 2').find(el => el.tagName === 'SPAN'));
    // Should auto-create a tab in group 2
    expect(await screen.findByText((c) => c.toLowerCase().includes('example tab'))).toBeInTheDocument();
  });

  it('pinned tabs toggle filters tabs in the UI', async () => {
    window.localStorage.setItem('atrium_groups', JSON.stringify([
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]));
    window.localStorage.setItem('atrium_tabs', JSON.stringify([
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: true, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 1 }
    ]));
    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Expand group 1 accordion
    fireEvent.click(screen.getAllByText('Group 1').find(el => el.tagName === 'SPAN'));
    // By default, both tabs shown
    expect(await screen.findByText((c) => c.includes('Tab A'))).toBeInTheDocument();
    expect(await screen.findByText((c) => c.includes('Tab B'))).toBeInTheDocument();
    // Toggle pinned off
    fireEvent.click(screen.getByLabelText(/include pinned/i));
    // Only unpinned tab should be shown
    expect(screen.queryByText((c) => c.includes('Tab A'))).not.toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('Tab B'))).toBeInTheDocument();
  });

  it('simulates tab open/close/navigation via UI controls', async () => {
    window.localStorage.setItem('atrium_groups', JSON.stringify([
      { id: 'g1', name: 'Group 1', color: '#1976d2', icon: 'folder', order: 0, lastActiveAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]));
    window.localStorage.setItem('atrium_tabs', JSON.stringify([
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: '', createdAt: new Date().toISOString(), order: 0 }
    ]));
    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    // Expand group 1 accordion
    fireEvent.click(screen.getAllByText('Group 1').find(el => el.tagName === 'SPAN'));
    // Simulate open
    fireEvent.click(screen.getByText(/simulate tab open/i));
    expect((await screen.findAllByText((c) => c.toLowerCase().includes('tab'))).length).toBeGreaterThan(1);
    // Simulate navigation
    fireEvent.click(screen.getByText(/simulate tab navigation/i));
    expect((await screen.findAllByText((c) => c.toLowerCase().includes('navigated tab'))).length + (await screen.findAllByText((c) => c.toLowerCase().includes('tab'))).length).toBeGreaterThan(1);
    // Simulate close
    fireEvent.click(screen.getByText(/simulate tab close/i));
    // At least one tab remains
    expect((await screen.findAllByText((c) => c.toLowerCase().includes('tab'))).length).toBeGreaterThan(0);
  });
});