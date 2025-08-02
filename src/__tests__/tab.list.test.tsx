import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TabList from '../components/TabList';
describe('Tab List', () => {
  it('renders tab titles and favicons', () => {
    // Mock localStorage for getTabs
    window.localStorage.setItem('atrium_tabs', JSON.stringify([
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString() },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString() }
    ]));
    render(<TabList groupId="g1" />);
    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
    expect(screen.getAllByAltText('favicon')).toHaveLength(2);
  });
});