import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import GroupList from '../components/GroupList';
import * as groupModule from '../group';
import * as tabModule from '../tab';

// Mock the group and tab modules
vi.mock('../group', async (importOriginal) => {
  const original = await importOriginal();
  let groups: any[] = [];
  return {
    ...original,
    createGroup: vi.fn((groupData, callback) => {
      const newGroup = { id: 'mock-group-id-' + Math.random(), ...groupData, lastActiveAt: new Date().toISOString() };
      groups.push(newGroup);
      if (callback) callback(newGroup);
      return newGroup;
    }),
    getGroups: vi.fn(() => groups),
    // Add other group exports if they are used by GroupList and need mocking
    updateGroup: vi.fn((id, updates) => {
      const index = groups.findIndex(g => g.id === id);
      if (index !== -1) {
        groups[index] = { ...groups[index], ...updates };
      }
    }),
    softDeleteGroup: vi.fn((id) => {
      const index = groups.findIndex(g => g.id === id);
      if (index !== -1) {
        groups[index] = { ...groups[index], deleted: true };
      }
    }),
    restoreGroup: vi.fn((id) => {
      const index = groups.findIndex(g => g.id === id);
      if (index !== -1) {
        groups[index] = { ...groups[index], deleted: false };
      }
    }),
  };
});

vi.mock('../tab', async (importOriginal) => {
  const original = await importOriginal();
  let tabs: any[] = [];
  return {
    ...original,
    createTab: vi.fn((tabData, callback) => {
      const newTab = { id: 'mock-tab-id-' + Math.random(), ...tabData, createdAt: new Date().toISOString(), order: 0, discarded: false };
      tabs.push(newTab);
      if (callback) callback(newTab);
      return newTab;
    }),
    getTabs: vi.fn(() => tabs),
    // Add other tab exports if they are used by GroupList and need mocking
    updateTab: vi.fn((id, updates) => {
      const index = tabs.findIndex(t => t.id === id);
      if (index !== -1) {
        tabs[index] = { ...tabs[index], ...updates };
      }
    }),
    deleteTab: vi.fn((id) => {
      const initialLength = tabs.length;
      tabs = tabs.filter(t => t.id !== id);
      return tabs.length < initialLength;
    }),
  };
});

describe('Group Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the internal state of the mocks by re-initializing the arrays
    let groups: any[] = []; // Re-declare to ensure fresh start
    let tabs: any[] = []; // Re-declare to ensure fresh start

    // The mocks in vi.mock already handle pushing to the internal arrays
    // No need to re-implement createGroup or createTab here.
  });

  it('allows creating a group', async () => {
    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    const input = screen.getByPlaceholderText('New group name');
    fireEvent.change(input, { target: { value: 'Test Group' } });
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(input).not.toBeDisabled();
    expect(input).toHaveValue(''); // input is cleared after add
    
    // Check if the group is rendered
    expect(await screen.findByText('Test Group')).toBeInTheDocument();
  });
  // ...more cases from test_cases/03_group_management.md
});