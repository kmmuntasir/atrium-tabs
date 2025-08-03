import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import GroupList from '../../src/components/GroupList';
import * as GroupStorage from '../../src/storage/GroupStorage';
import * as TabStorage from '../../src/storage/TabStorage';
import { Group } from '../../src/types/Group';
import { Tab } from '../../src/types/Tab';

vi.mock('../../src/storage/TabStorage', () => ({
  getTabsByGroup: vi.fn(),
}));

describe('GroupList Integration', () => {
  const mockGroups: Group[] = [
    { uuid: 'g1', name: 'Work Group', color: 'blue', icon: 'briefcase' },
  ];

  const mockTabs: Tab[] = [
    { uuid: 't1', groupId: 'g1', url: 'https://work.com/1', title: 'Work Tab 1', faviconUrl: 'fav1.png' },
    { uuid: 't2', groupId: 'g1', url: 'https://work.com/2', title: 'Work Tab 2', faviconUrl: 'fav2.png' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(GroupStorage, 'getGroups').mockReturnValue(mockGroups);
    (TabStorage.getTabsByGroup as ReturnType<typeof vi.fn>).mockImplementation((groupId) => {
      if (groupId === 'g1') return mockTabs;
      return [];
    });
  });

  it('should display groups and allow expansion to show tabs', async () => {
    render(<GroupList />);

    // Verify group is displayed with correct tab count
    expect(screen.getByText(/Work Group \(2\)/)).toBeInTheDocument();

    // Tabs should not be visible initially
    expect(screen.queryByText('Work Tab 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Work Tab 2')).not.toBeInTheDocument();

    // Click to expand the group
    fireEvent.click(screen.getByText(/Work Group \(2\)/));

    // Tabs should now be visible
    await waitFor(() => {
      expect(screen.getByText('Work Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Work Tab 2')).toBeInTheDocument();
    });

    // Verify favicons are displayed
    expect(screen.getAllByAltText('favicon')).toHaveLength(mockTabs.length);

    // Click to collapse the group
    fireEvent.click(screen.getByText(/Work Group \(2\)/));

    // Tabs should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Work Tab 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Work Tab 2')).not.toBeInTheDocument();
    });
  });

  it('should update tab count when tabs are added or removed (simulated)', async () => {
    const initialTabs: Tab[] = [
      { uuid: 't1', groupId: 'g1', url: 'https://work.com/1', title: 'Work Tab 1', faviconUrl: 'fav1.png' },
    ];
    const updatedTabs: Tab[] = [
      ...initialTabs,
      { uuid: 't2', groupId: 'g1', url: 'https://work.com/2', title: 'Work Tab 2', faviconUrl: 'fav2.png' },
    ];

    // Mock initial state
    vi.spyOn(TabStorage, 'getTabsByGroup').mockImplementation((groupId) => {
      if (groupId === 'g1') return initialTabs;
      return [];
    });

    const { rerender } = render(<GroupList />);

    // Initial tab count
    expect(screen.getByText(/Work Group \(1\)/)).toBeInTheDocument();

    // Simulate tab addition (by updating the mock and re-rendering)
    vi.spyOn(TabStorage, 'getTabsByGroup').mockImplementation((groupId) => {
      if (groupId === 'g1') return updatedTabs;
      return [];
    });

    rerender(<GroupList />);

    // Updated tab count
    expect(screen.getByText(/Work Group \(2\)/)).toBeInTheDocument();

    // Expand and check tabs
    fireEvent.click(screen.getByText(/Work Group \(2\)/));
    await waitFor(() => {
      expect(screen.getByText('Work Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Work Tab 2')).toBeInTheDocument();
    });
  });
});