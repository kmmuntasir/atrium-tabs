import React from 'react';
import { Tab, getTabs } from '../tab';
import { Button } from '@radix-ui/themes';
import { undiscardTab } from '../background';

interface TabListProps {
  groupId: string;
  tabs: Tab[];
  onTabRemove?: (tabId: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  onTabDrop?: (tabId: string, fromGroupId: string, toGroupId: string, copy: boolean) => void;
  lastActiveTabId?: string;
  onTabClick?: (tabId: string) => void;
  eagerLoad: boolean; // New prop for eager load setting
}

export default function TabList({ groupId, tabs, onTabRemove, onTabReorder, onTabDrop, lastActiveTabId, onTabClick, eagerLoad }: TabListProps) {
  // Drag-and-drop state
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);
  const [draggedTabId, setDraggedTabId] = React.useState<string | null>(null);

  const handleOpenNewTab = () => {
    // In a real extension, would use chrome.tabs.create
    alert('Would open a new tab in this group (mock)');
  };

  // Handle drag start for cross-group
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
    setDraggedTabId(tabs[idx].id);
  };
  const handleDragEnter = (idx: number) => setDragOverIdx(idx);
  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDraggedTabId(null);
  };
  // Handle drop for cross-group
  const handleDrop = (e: React.DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    if (onTabDrop && draggedTabId) {
      const fromGroupId = e.dataTransfer.getData('fromGroupId');
      const copy = e.ctrlKey || e.metaKey;
      onTabDrop(draggedTabId, fromGroupId, groupId, copy);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDraggedTabId(null);
  };
  const handleDragOver = (e: React.DragEvent<HTMLUListElement>) => {
    e.preventDefault();
  };

  const tabRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  React.useEffect(() => {
    const idx = tabs.findIndex(tab => tab.id === lastActiveTabId);
    if (idx !== -1 && tabRefs.current[idx]) {
      if (typeof tabRefs.current[idx].scrollIntoView === 'function') {
        tabRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      tabRefs.current[idx].focus?.();
    }
  }, [lastActiveTabId, tabs]);

  const handleTabClick = (tabId: string) => {
    if (onTabClick) {
      onTabClick(tabId);
    }
    const clickedTab = tabs.find(t => t.id === tabId);
    // If lazy loading is enabled and the tab is discarded, undiscard it.
    if (!eagerLoad && clickedTab?.discarded) {
      undiscardTab(tabId);
    }
  };

  return (
    <ul style={{ listStyle: 'none', paddingLeft: 20, marginTop: 8 }} onDrop={handleDrop} onDragOver={handleDragOver}>
      {tabs.length === 0 && (
        <li style={{ fontSize: '0.8em', color: '#666' }}>
          No tabs in this group.
          <Button style={{ marginLeft: 8 }} onClick={handleOpenNewTab}>Open New Tab</Button>
        </li>
      )}
      {tabs.map((tab, idx) => (
          <li
            key={tab.id}
            ref={el => tabRefs.current[idx] = el}
            tabIndex={tab.id === lastActiveTabId ? 0 : -1}
            onClick={() => handleTabClick(tab.id)}
            style={{ display: 'flex', alignItems: 'center', marginBottom: 4, background: dragOverIdx === idx ? '#f0f0f0' : undefined, cursor: 'grab' }}
            draggable
            onDragStart={e => { handleDragStart(idx); e.dataTransfer.setData('fromGroupId', groupId); }}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
          >
            <span style={{ marginRight: 8, cursor: 'grab' }} title="Drag to reorder">☰</span>
            <img src={tab.favicon || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='} alt="favicon" style={{ width: 16, height: 16, marginRight: 8 }} />
            <span style={{ fontSize: '0.9em', flex: 1 }} data-testid={`tab-label-${tab.id}`}>{tab.title || tab.url}</span>
            <button
              aria-label="Remove tab"
              style={{ marginLeft: 8, background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: 16 }}
              onClick={() => onTabRemove && onTabRemove(tab.id)}
            >
              ✕
            </button>
          </li>
        ))}
    </ul>
  );
}