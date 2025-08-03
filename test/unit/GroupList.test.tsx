import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../src/storage/GroupStorage', () => ({
  getGroups: vi.fn(),
}));

import GroupList from '../../src/components/GroupList';
import * as GroupStorage from '../../src/storage/GroupStorage';

describe('GroupList', () => {
  beforeEach(() => {
    // Reset mock before each test
    vi.clearAllMocks();
    (GroupStorage.getGroups as ReturnType<typeof vi.fn>).mockReturnValue([]); // Default mock implementation
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
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.queryByText('No groups found. Create a new one!')).not.toBeInTheDocument();
    expect(GroupStorage.getGroups).toHaveBeenCalledTimes(1);
  });
});