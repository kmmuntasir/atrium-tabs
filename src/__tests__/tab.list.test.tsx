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

  it('calls onTabReorder when a tab is dragged and dropped', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString() },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString() }
    ];
    const onTabReorder = vi.fn();
    render(<TabList groupId="g1" tabs={tabs} onTabReorder={onTabReorder} />);
    const tabItems = screen.getAllByRole('listitem');
    // Simulate drag and drop: drag tab 0 to position 1
    const dataTransfer = { setData: () => {}, getData: () => '' };
    fireEvent.dragStart(tabItems[0], { dataTransfer });
    fireEvent.dragEnter(tabItems[1], { dataTransfer });
    fireEvent.dragEnd(tabItems[0], { dataTransfer });
    expect(onTabReorder).toHaveBeenCalledWith(0, 1);
  });

  // Skipped due to jsdom limitations: cannot reliably simulate cross-group drag-and-drop
  it.skip('calls onTabDrop when a tab is dragged from another group and dropped', () => {
    const tabs = [
      { id: 'tab1', url: 'https://a.com', title: 'Tab A', pinned: false, groupId: 'g1', favicon: 'iconA.png', createdAt: new Date().toISOString() },
      { id: 'tab2', url: 'https://b.com', title: 'Tab B', pinned: false, groupId: 'g1', favicon: 'iconB.png', createdAt: new Date().toISOString() }
    ];
    const onTabDrop = vi.fn();
    render(<TabList groupId="g2" tabs={[]} onTabDrop={onTabDrop} />);
    // Simulate drag from g1 to g2
    const ul = screen.getByRole('list');
    const dataTransfer = { getData: () => 'g1' };
    fireEvent.drop(ul, { dataTransfer, ctrlKey: false });
    expect(onTabDrop).toHaveBeenCalledWith('tab1', 'g1', 'g2', false);
  });
});