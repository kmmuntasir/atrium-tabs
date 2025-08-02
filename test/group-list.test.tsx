// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GroupList from '../src/components/GroupList';
import * as groupModule from '../src/group';
import * as tabModule from '../src/tab';

// Mock localStorage for GroupList component's useState initial value
globalThis.localStorage = {
  _data: {} as Record<string, string>,
  getItem(key: string) { return this._data[key] || null; },
  setItem(key: string, value: string) { this._data[key] = value; },
  removeItem(key: string) { delete this._data[key]; },
  clear() { this._data = {}; },
} as Storage;

const mockGroups = [
  { id: '1', name: 'Work', createdAt: '', updatedAt: '', color: '#FF0000', icon: 'briefcase', order: 1, lastActiveAt: '' },
  { id: '2', name: 'Personal', createdAt: '', updatedAt: '', color: '#00FF00', icon: 'home', order: 2, lastActiveAt: '' },
];
const mockTabs = [
  { id: 'a', url: 'http://work1.com', title: 'Work Tab 1', pinned: false, groupId: '1', favicon: 'fav1.ico', createdAt: '' },
  { id: 'b', url: 'http://work2.com', title: 'Work Tab 2', pinned: false, groupId: '1', favicon: 'fav2.ico', createdAt: '' },
  { id: 'c', url: 'http://personal1.com', title: 'Personal Tab 1', pinned: false, groupId: '2', favicon: 'fav3.ico', createdAt: '' },
];

describe('GroupList', () => {
  beforeEach(() => {
    vi.spyOn(groupModule, 'getGroups').mockReturnValue(mockGroups);
    vi.spyOn(tabModule, 'getTabs').mockReturnValue(mockTabs);
    localStorage.clear(); // Clear expanded groups state for each test
  });

  afterEach(cleanup); // Ensure component unmounts after each test

  it('renders group info and icons with colors', () => {
    render(<GroupList />);
    expect(screen.getByText('Work')).toBeDefined();
    expect(screen.getByText('Personal')).toBeDefined();
    // Check for icons by their SVG roles or specific attributes if needed
    expect(screen.getByTestId('briefcase-icon')).toBeDefined(); // Assuming we add data-testid to icon
    expect(screen.getByTestId('home-icon')).toBeDefined(); // Assuming we add data-testid to icon
    expect(screen.getByText('(2)')).toBeDefined();
    expect(screen.getByText('(1)')).toBeDefined();
    // Lock icon for group 2 (mocked as active elsewhere)
    expect(screen.getByTitle('Active elsewhere')).toBeDefined();

    // Check color application (might require more advanced testing, or visual regression)
    // For now, assert that the style attribute exists for color
    expect(screen.getByTestId('briefcase-icon').style.color).toBe('rgb(255, 0, 0)');
    expect(screen.getByTestId('home-icon').style.color).toBe('rgb(0, 255, 0)');
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