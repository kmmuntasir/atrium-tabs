// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Popup from '../src/components/Popup';
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

describe('Popup', () => {
  beforeEach(() => {
    vi.spyOn(groupModule, 'getGroups').mockReturnValue(mockGroups);
    vi.spyOn(tabModule, 'getTabs').mockReturnValue(mockTabs);
  });

  afterEach(cleanup); // Ensure component unmounts after each test

  it('renders group list with group info', () => {
    render(<Popup />);
    expect(screen.getByText('Atrium Tabs')).toBeDefined();
    expect(screen.getByText('Work')).toBeDefined();
    expect(screen.getByText('Personal')).toBeDefined();
    expect(screen.getAllByText('💼')[0]).toBeDefined();
    expect(screen.getAllByText('🏠')[0]).toBeDefined();
    expect(screen.getByText('(2)')).toBeDefined();
    expect(screen.getByText('(1)')).toBeDefined();
  });
});