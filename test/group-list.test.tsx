// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupList from '../src/components/GroupList';
import * as groupModule from '../src/group';
import * as tabModule from '../src/tab';

const mockGroups = [
  { id: '1', name: 'Work', createdAt: '', updatedAt: '', color: '', icon: '💼', order: 1, lastActiveAt: '' },
  { id: '2', name: 'Personal', createdAt: '', updatedAt: '', color: '', icon: '🏠', order: 2, lastActiveAt: '' },
];
const mockTabs = [
  { id: 'a', url: '', title: '', pinned: false, groupId: '1', favicon: '', createdAt: '' },
  { id: 'b', url: '', title: '', pinned: false, groupId: '1', favicon: '', createdAt: '' },
  { id: 'c', url: '', title: '', pinned: false, groupId: '2', favicon: '', createdAt: '' },
];

describe('GroupList', () => {
  beforeEach(() => {
    vi.spyOn(groupModule, 'getGroups').mockReturnValue(mockGroups);
    vi.spyOn(tabModule, 'getTabs').mockReturnValue(mockTabs);
  });

  it('renders group info and lock icon', () => {
    render(<GroupList />);
    expect(screen.getByText('Work')).toBeDefined();
    expect(screen.getByText('Personal')).toBeDefined();
    expect(screen.getAllByText('💼')[0]).toBeDefined();
    expect(screen.getAllByText('🏠')[0]).toBeDefined();
    expect(screen.getByText('(2)')).toBeDefined();
    expect(screen.getByText('(1)')).toBeDefined();
    // Lock icon for group 2 (mocked as active elsewhere)
    expect(screen.getByTitle('Active elsewhere')).toBeDefined();
  });
});