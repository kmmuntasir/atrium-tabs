import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TabList from '../components/TabList';
describe('Tab List', () => {
  it('renders tab titles and favicons', () => {
    // Mock localStorage for getTabs
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString() },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString() }
    ];
    render(<TabList groupId="g1" tabs={tabs} />);
    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
    expect(screen.getAllByAltText('favicon')).toHaveLength(2);
  });

  it('calls onTabRemove when the remove button is clicked', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString() },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString() }
    ];
    const onTabRemove = vi.fn();
    render(<TabList groupId="g1" tabs={tabs} onTabRemove={onTabRemove} />);
    const removeButtons = screen.getAllByRole('button', { name: /remove tab/i });
    fireEvent.click(removeButtons[0]);
    expect(onTabRemove).toHaveBeenCalledWith('tab1');
  });
});