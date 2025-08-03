import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../src/storage/GroupStorage', () => ({
  getGroups: vi.fn(),
}));

vi.mock('../../src/storage/TabStorage', () => ({
  getTabsByGroup: vi.fn(),
}));

import GroupList from '../../src/components/GroupList';
import * as GroupStorage from '../../src/storage/GroupStorage';
import * as TabStorage from '../../src/storage/TabStorage';

describe('GroupList', () => {
  beforeEach(() => {
    // Reset mock before each test
    vi.clearAllMocks();
    (GroupStorage.getGroups as ReturnType<typeof vi.fn>).mockReturnValue([]); // Default mock implementation
    (TabStorage.getTabsByGroup as ReturnType<typeof vi.fn>).mockReturnValue([]); // Default mock implementation
  });

  it('displays a message when no groups are found', () => {
    render(<GroupList />);
    expect(screen.getByText('No groups found. Create a new one!')).toBeInTheDocument();
    expect(GroupStorage.getGroups).toHaveBeenCalledTimes(1);
  });

  it('displays a list of groups when groups are available', () => {
    const mockGroups = [
      { uuid: '1', name: 'Work', color: 'blue', icon: 'briefcase' },
      { uuid: '2', name: 'Personal', color: 'green', icon: 'home' },
    ];
    (GroupStorage.getGroups as ReturnType<typeof vi.fn>).mockReturnValue(mockGroups);

    render(<GroupList />);
    expect(screen.getByText(/Work \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Personal \(0\)/)).toBeInTheDocument();
    expect(screen.queryByText('No groups found. Create a new one!')).not.toBeInTheDocument();
    expect(GroupStorage.getGroups).toHaveBeenCalledTimes(1);
  });

  it('expands and collapses a group to show/hide tabs', () => {
    const mockGroups = [
      { uuid: '1', name: 'Work', color: 'blue', icon: 'briefcase' },
    ];
    const mockTabs = [
      { uuid: 't1', groupId: '1', url: 'https://example.com/1', title: 'Tab 1', faviconUrl: 'fav1.png' },
      { uuid: 't2', groupId: '1', url: 'https://example.com/2', title: 'Tab 2', faviconUrl: 'fav2.png' },
    ];

    (GroupStorage.getGroups as ReturnType<typeof vi.fn>).mockReturnValue(mockGroups);
    (TabStorage.getTabsByGroup as ReturnType<typeof vi.fn>).mockImplementation((groupId: string) => {
      if (groupId === '1') return mockTabs;
      return [];
    });

    render(<GroupList />);

    // Tabs should not be visible initially
    expect(screen.queryByText('Tab 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 2')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText(/Work \(2\)/));
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getAllByAltText('favicon')).toHaveLength(mockTabs.length); // Check for favicons

    // Click to collapse
    fireEvent.click(screen.getByText(/Work \(2\)/));
    expect(screen.queryByText('Tab 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 2')).not.toBeInTheDocument();
  });

  it('displays correct tab count in group header', () => {
    const mockGroups = [
      { uuid: '1', name: 'Work', color: 'blue', icon: 'briefcase' },
    ];
    const mockTabs = [
      { uuid: 't1', groupId: '1', url: 'https://example.com/1', title: 'Tab 1', faviconUrl: 'fav1.png' },
      { uuid: 't2', groupId: '1', url: 'https://example.com/2', title: 'Tab 2', faviconUrl: 'fav2.png' },
    ];

    (GroupStorage.getGroups as ReturnType<typeof vi.fn>).mockReturnValue(mockGroups);
    (TabStorage.getTabsByGroup as ReturnType<typeof vi.fn>).mockImplementation((groupId: string) => {
      if (groupId === '1') return mockTabs;
      return [];
    });

    render(<GroupList />);
    expect(screen.getByText(/Work \(2\)/)).toBeInTheDocument();
  });
});