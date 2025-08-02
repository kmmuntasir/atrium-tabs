// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GroupList from '../src/components/GroupList';
import * as groupModule from '../src/group';
import * as tabModule from '../src/tab';

const mockGroups = [
  { id: '1', name: 'Work', createdAt: '', updatedAt: '', color: '', icon: '💼', order: 1, lastActiveAt: '' },
  { id: '2', name: 'Personal', createdAt: '', updatedAt: '', color: '', icon: '🏠', order: 2, lastActiveAt: '' },
];
const mockTabs = [
  { id: 'a', url: 'http://work1.com', title: 'Work Tab 1', pinned: false, groupId: '1', favicon: 'fav1.ico', createdAt: '' },
  { id: 'b', url: 'http://work2.com', title: 'Work Tab 2', pinned: false, groupId: '1', favicon: 'fav2.ico', createdAt: '' },
  { id: 'c', url: 'http://personal1.com', title: 'Personal Tab 1', pinned: false, groupId: '2', favicon: 'fav3.ico', createdAt: '' },
];

// Simple in-memory localStorage mock for expandedGroups
globalThis.localStorage = {
  _data: {} as Record<string, string>,
  getItem(key: string) { return this._data[key] || null; },
  setItem(key: string, value: string) { this._data[key] = value; },
  removeItem(key: string) { delete this._data[key]; },
  clear() { this._data = {}; },
} as Storage;

describe('GroupList', () => {
  beforeEach(() => {
    vi.spyOn(groupModule, 'getGroups').mockReturnValue(mockGroups);
    vi.spyOn(tabModule, 'getTabs').mockReturnValue(mockTabs);
    localStorage.clear(); // Clear expanded groups state for each test
  });

  afterEach(cleanup); // Ensure component unmounts after each test

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

  it('expands and collapses a group to show tabs', async () => {
    render(<GroupList />);

    // Initially tabs should not be visible
    expect(screen.queryByText('Work Tab 1')).toBeNull();
    expect(screen.queryByText('Personal Tab 1')).toBeNull();

    // Click on Work group to expand (use getAllByText and select first instance)
    fireEvent.click(screen.getAllByText('Work')[0]);
    expect(screen.getByText('Work Tab 1')).toBeDefined();
    expect(screen.getByText('Work Tab 2')).toBeDefined();
    expect(screen.queryByText('Personal Tab 1')).toBeNull(); // Other group's tabs should not appear

    // Click on Work group again to collapse
    fireEvent.click(screen.getAllByText('Work')[0]);
    expect(screen.queryByText('Work Tab 1')).toBeNull();
    expect(screen.queryByText('Work Tab 2')).toBeNull();

    // Click on Personal group to expand
    fireEvent.click(screen.getAllByText('Personal')[0]);
    expect(screen.getByText('Personal Tab 1')).toBeDefined();
  });

  it('persists expanded state across renders', () => {
    // Simulate initial expansion
    localStorage.setItem('atrium_expanded_groups', JSON.stringify(['1']));

    const { rerender } = render(<GroupList />);
    expect(screen.getByText('Work Tab 1')).toBeDefined();
    expect(screen.queryByText('Personal Tab 1')).toBeNull();

    // Simulate another render (e.g., parent component update)
    rerender(<GroupList />);
    expect(screen.getByText('Work Tab 1')).toBeDefined();
  });
});