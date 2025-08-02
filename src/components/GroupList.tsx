import React, { useState } from 'react';
import { getGroups, Group, createGroup, updateGroup, softDeleteGroup, restoreGroup, deleteGroup, saveGroups } from '../group';
import { getTabs, createTab, updateTab, deleteTab, saveTabs } from '../tab';
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  Book, 
  Home, 
  Briefcase, 
  Star, 
  Heart, 
  Settings, 
  Bell, 
  Flag, 
  Globe,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  ExternalLink
} from 'lucide-react';
import TabList from './TabList';
import { useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Accordion from '@radix-ui/react-accordion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Button } from '@radix-ui/themes';

// Mapping of icon names to Lucide icons
const LucideIcons: { [key: string]: React.ElementType } = {
  folder: Folder,
  book: Book,
  home: Home,
  briefcase: Briefcase,
  star: Star,
  heart: Heart,
  settings: Settings,
  bell: Bell,
  flag: Flag,
  globe: Globe,
  // Add more as needed
};

function LockIcon() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span style={{ marginLeft: 8 }}>🔒</span>
      </Tooltip.Trigger>
      <Tooltip.Content>This group is active in another window</Tooltip.Content>
    </Tooltip.Root>
  );
}

function getRandomColor() {
  const colors = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function isGroupActiveElsewhere(groupId: string, currentWindowId = 'window-1'): boolean {
  // Mock: group with even index is active elsewhere
  // In real extension, check group state across windows
  return groupId.endsWith('2') || groupId.endsWith('4');
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>(getGroups());
  const [tabs, setTabs] = useState(getTabs());
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('atrium_expanded_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [selectorId, setSelectorId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groups.length > 0 ? groups[0].id : null);
  const [includePinned, setIncludePinned] = useState(() => {
    const saved = localStorage.getItem('atrium_include_pinned');
    return saved ? JSON.parse(saved) : true;
  });
  const handlePinnedToggle = () => {
    setIncludePinned(prev => {
      localStorage.setItem('atrium_include_pinned', JSON.stringify(!prev));
      return !prev;
    });
  };
  React.useEffect(() => {
    if (!activeGroupId) return;
    const groupTabs = tabs.filter(t => t.groupId === activeGroupId);
    if (groupTabs.length === 0) {
      // Auto-create a new tab in the empty group
      createTab({
        url: `https://example.com/${Math.floor(Math.random() * 1000)}`,
        title: `Example Tab ${Math.floor(Math.random() * 1000)}`,
        favicon: '',
        pinned: false,
        groupId: activeGroupId,
      });
      setTabs(getTabs());
    }
  }, [activeGroupId, tabs]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('atrium_group_sort') || 'manual');
  const handleSortChange = (value: string) => {
    setSortOrder(value);
    localStorage.setItem('atrium_group_sort', value);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    const group = createGroup({
      name: newGroupName.trim(),
      color: '#1976d2', // default blue
      icon: 'folder', // default icon
      order: groups.length,
      lastActiveAt: new Date().toISOString(),
    });
    setGroups(getGroups());
    setNewGroupName('');
    setCreating(false);
  };

  const handleSaveWindowAsGroup = () => {
    const allTabs = getTabs();
    const groupName = `Window Group ${groups.length + 1}`;
    const color = getRandomColor();
    const group = createGroup({
      name: groupName,
      color,
      icon: 'folder',
      order: groups.length,
      lastActiveAt: new Date().toISOString(),
    });
    // In a real extension, here we'd assign allTabs to this group
    setGroups(getGroups());
  };

  const handleAddTabToActiveGroup = () => {
    if (!activeGroupId) return;
    // Mock tab data
    const url = `https://example.com/${Math.floor(Math.random() * 1000)}`;
    const title = `Example Tab ${Math.floor(Math.random() * 1000)}`;
    const favicon = '';
    const pinned = false;
    const newTab = {
      url,
      title,
      favicon,
      pinned,
      groupId: activeGroupId,
    };
    // Use createTab from tab.ts
    createTab(newTab);
    setTabs(getTabs());
  };

  // For demo, mock group 2 as active elsewhere
  const activeElsewhereId = groups[1]?.id;

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId];
      localStorage.setItem('atrium_expanded_groups', JSON.stringify(newExpanded));
      return newExpanded;
    });
  };

  const startEditing = (group: Group) => {
    setEditingId(group.id);
    setEditName(group.name);
  };

  const saveEdit = (group: Group) => {
    if (editName.trim() && editName !== group.name) {
      updateGroup(group.id, { name: editName.trim() });
      setGroups(getGroups());
    }
    setEditingId(null);
    setEditName('');
  };

  const openSelector = (group: Group) => {
    setSelectorId(group.id);
    setSelectedColor(group.color);
    setSelectedIcon(group.icon);
  };
  const closeSelector = () => {
    setSelectorId(null);
    setSelectedColor('');
    setSelectedIcon('');
  };
  const saveSelector = (group: Group) => {
    updateGroup(group.id, { color: selectedColor, icon: selectedIcon });
    setGroups(getGroups());
    closeSelector();
  };

  const handleOpenInNewWindow = (group: Group) => {
    // In a real extension, would use chrome.windows.create
    alert(`Would open group '${group.name}' in a new window (mock)`);
  };

  const ICON_OPTIONS = [
    'folder', 'book', 'home', 'briefcase', 'star', 'heart', 'settings', 'bell', 'flag', 'globe'
  ];
  const COLOR_OPTIONS = [
    '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b'
  ];

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };
  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const newGroups = [...groups];
    const [removed] = newGroups.splice(dragItem.current, 1);
    newGroups.splice(dragOverItem.current, 0, removed);
    // Update order field
    newGroups.forEach((g, i) => g.order = i);
    saveGroups(newGroups);
    setGroups(getGroups());
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleRemoveTab = (tabId: string) => {
    deleteTab(tabId);
    setTabs(getTabs());
  };

  const handleReorderTabs = (fromIdx: number, toIdx: number, groupId?: string) => {
    // Only reorder tabs within the same group
    const groupTabs = tabs.filter(t => t.groupId === groupId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx || fromIdx >= groupTabs.length || toIdx >= groupTabs.length) return;
    const reordered = [...groupTabs];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    // Update order field
    reordered.forEach((t, i) => t.order = i);
    // Update all tabs
    const otherTabs = tabs.filter(t => t.groupId !== groupId);
    const newTabs = [...otherTabs, ...reordered];
    saveTabs(newTabs);
    setTabs(getTabs());
  };

  const handleTabDrop = (tabId: string, fromGroupId: string, toGroupId: string, copy: boolean) => {
    if (fromGroupId === toGroupId) return; // Ignore same-group drops (handled by reorder)
    const allTabs = getTabs();
    const tab = allTabs.find(t => t.id === tabId);
    if (!tab) return;
    if (copy) {
      // Copy: create new tab in target group with new id/order
      createTab({
        url: tab.url,
        title: tab.title,
        pinned: tab.pinned,
        groupId: toGroupId,
        favicon: tab.favicon,
      });
    } else {
      // Move: update groupId and order, remove from old group
      const targetTabs = allTabs.filter(t => t.groupId === toGroupId);
      tab.groupId = toGroupId;
      tab.order = targetTabs.length;
      saveTabs(allTabs);
    }
    setTabs(getTabs());
  };

  let sortedGroups = groups.filter(g => !g.deleted);
  if (sortOrder === 'alphabetical') {
    sortedGroups = [...sortedGroups].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'lastUsed') {
    sortedGroups = [...sortedGroups].sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
  } else {
    sortedGroups = [...sortedGroups].sort((a, b) => a.order - b.order);
  }

  const currentWindowId = 'window-1'; // Mocked for now
  const [lastActiveTabIdByGroup, setLastActiveTabIdByGroup] = useState<{ [groupId: string]: string }>({});

  const SORT_OPTIONS = [
    { value: 'manual', label: 'Manual' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'lastUsed', label: 'Last Used' },
  ];

  return (
    <>
      <form onSubmit={handleCreateGroup} style={{ display: 'flex', marginBottom: 12 }}>
        <input
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          style={{ flex: 1, marginRight: 8 }}
          disabled={creating}
        />
        <Button type="submit" disabled={creating || !newGroupName.trim()}>Add</Button>
      </form>
      <Button onClick={handleSaveWindowAsGroup} style={{ marginBottom: 16, width: '100%' }}>
        Save Current Window as Group
      </Button>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <Button onClick={handleAddTabToActiveGroup} disabled={!activeGroupId}>Simulate Tab Open</Button>
        <Button
          onClick={() => {
            if (!activeGroupId) return;
            const groupTabs = tabs.filter(t => t.groupId === activeGroupId);
            if (groupTabs.length === 0) return;
            const tabToClose = groupTabs[Math.floor(Math.random() * groupTabs.length)];
            deleteTab(tabToClose.id);
            setTabs(getTabs());
          }}
          disabled={!activeGroupId || tabs.filter(t => t.groupId === activeGroupId).length === 0}
        >Simulate Tab Close</Button>
        <Button
          onClick={() => {
            if (!activeGroupId) return;
            const groupTabs = tabs.filter(t => t.groupId === activeGroupId);
            if (groupTabs.length === 0) return;
            const tabToNav = groupTabs[Math.floor(Math.random() * groupTabs.length)];
            updateTab(tabToNav.id, {
              url: `https://navigated.com/${Math.floor(Math.random() * 1000)}`,
              title: `Navigated Tab ${Math.floor(Math.random() * 1000)}`,
            });
            setTabs(getTabs());
          }}
          disabled={!activeGroupId || tabs.filter(t => t.groupId === activeGroupId).length === 0}
        >Simulate Tab Navigation</Button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="active-group-select" style={{ marginRight: 8 }}>Active group:</label>
        <select
          id="active-group-select"
          value={activeGroupId || ''}
          onChange={e => setActiveGroupId(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="" disabled>Select group</option>
          {groups.filter(g => !g.deleted).map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <Button onClick={handleAddTabToActiveGroup} disabled={!activeGroupId}>Add Tab to Active Group</Button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="group-sort" style={{ marginRight: 8 }}>Sort groups:</label>
        <Select.Root value={sortOrder} onValueChange={handleSortChange}>
          <Select.Trigger id="group-sort" />
          <Select.Content>
            {SORT_OPTIONS.map(opt => (
              <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>
          <input type="checkbox" checked={includePinned} onChange={handlePinnedToggle} />
          Include pinned tabs in groups
        </label>
      </div>
      <Accordion.Root type="multiple" value={expandedGroups} onValueChange={setExpandedGroups}>
        {sortedGroups.map((group, idx) => {
          const IconComponent = group.icon ? LucideIcons[group.icon.toLowerCase()] : Folder;
          const isEditing = editingId === group.id;
          const isSelecting = selectorId === group.id;
          const isPendingDelete = pendingDeleteId === group.id;
          const isActiveElsewhere = isGroupActiveElsewhere(group.id, currentWindowId);
          return (
            <Accordion.Item value={group.id} key={group.id}>
              <Accordion.Trigger asChild>
                <li
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    cursor: isPendingDelete ? 'not-allowed' : 'grab',
                    opacity: isPendingDelete ? 0.5 : 1,
                    textDecoration: isPendingDelete ? 'line-through' : 'none',
                    background: dragOverItem.current === idx ? '#f0f0f0' : undefined,
                    pointerEvents: isActiveElsewhere ? 'none' : undefined,
                    opacity: isActiveElsewhere ? 0.5 : 1,
                  }}
                  title={isActiveElsewhere ? 'This group is active in another window' : undefined}
                >
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span role="button" aria-label="Drag to reorder" style={{ marginRight: 8, cursor: 'grab' }} tabIndex={0}>
                        ☰
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Drag to reorder</Tooltip.Content>
                  </Tooltip.Root>
                  <span style={{ marginRight: 8 }} onClick={e => { e.stopPropagation(); openSelector(group); }}>
                    {IconComponent ? <IconComponent size={16} style={{ color: group.color }} data-testid={(group.icon ? group.icon.toLowerCase() : 'folder') + '-icon'} /> : group.icon || '📁'}
                  </span>
                  <span style={{ flex: 1 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => saveEdit(group)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit(group);
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditName(group.name);
                          }
                        }}
                        style={{ width: '100%', padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
                      />
                    ) : (
                      <span style={{ cursor: 'pointer' }} onClick={() => startEditing(group)}>
                        {group.name}
                      </span>
                    )}
                  </span>
                  <span style={{ marginLeft: 8 }}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <span style={{ cursor: 'pointer' }} onClick={() => openSelector(group)}>
                          <Pencil size={16} />
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Edit Group</Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <span style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => {
                          if (isPendingDelete) {
                            restoreGroup(group.id);
                            setGroups(getGroups());
                            setPendingDeleteId(null);
                          } else {
                            softDeleteGroup(group.id);
                            setGroups(getGroups());
                            setPendingDeleteId(group.id);
                          }
                        }}>
                          {isPendingDelete ? <RotateCcw size={16} /> : <Trash2 size={16} />}
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{isPendingDelete ? 'Restore' : 'Delete'}</Tooltip.Content>
                    </Tooltip.Root>
                    {isActiveElsewhere && <LockIcon />}
                  </span>
                </li>
              </Accordion.Trigger>
              <Accordion.Content>
                <TabList
                  groupId={group.id}
                  tabs={tabs.filter(t => t.groupId === group.id && (includePinned || !t.pinned))}
                  lastActiveTabId={lastActiveTabIdByGroup[group.id]}
                  onTabClick={tabId => setLastActiveTabIdByGroup(prev => ({ ...prev, [group.id]: tabId }))}
                  onRemoveTab={handleRemoveTab}
                  onReorderTabs={handleReorderTabs}
                  onTabDrop={handleTabDrop}
                  includePinned={includePinned}
                />
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
      <Dialog.Root open={!!selectorId} onOpenChange={setSelectorId}>
        <Dialog.Content>
          <Dialog.Header>Edit Group</Dialog.Header>
          <Dialog.Body>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="group-name" style={{ marginRight: 8 }}>Name:</label>
              <input
                type="text"
                id="group-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button onClick={() => saveSelector(groups.find(g => g.id === selectorId)!)} disabled={!editName.trim()}>Save</Button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="group-color" style={{ marginRight: 8 }}>Color:</label>
              <Select.Root value={selectedColor} onValueChange={setSelectedColor}>
                <Select.Trigger id="group-color" />
                <Select.Content>
                  {COLOR_OPTIONS.map(color => (
                    <Select.Item key={color} value={color}>
                      <div style={{ backgroundColor: color, width: 20, height: 20, borderRadius: 4, marginRight: 8 }} />
                      {color}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="group-icon" style={{ marginRight: 8 }}>Icon:</label>
              <Select.Root value={selectedIcon} onValueChange={setSelectedIcon}>
                <Select.Trigger id="group-icon" />
                <Select.Content>
                  {ICON_OPTIONS.map(icon => (
                    <Select.Item key={icon} value={icon}>
                      <div style={{ marginRight: 8 }}>{LucideIcons[icon] ? React.createElement(LucideIcons[icon], { size: 20 }) : null}</div>
                      {icon}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="soft" onClick={closeSelector}>Cancel</Button>
            <Button onClick={() => saveSelector(groups.find(g => g.id === selectorId)!)} disabled={!editName.trim()}>Save</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}