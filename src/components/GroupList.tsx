import React, { useState } from 'react';
import { getGroups, Group, createGroup, updateGroup, softDeleteGroup, restoreGroup, deleteGroup, saveGroups } from '../group';
import { getTabs } from '../tab';
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
import * as Button from '@radix-ui/react-button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

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
  return <span title="This group is active in another window" style={{ marginLeft: 8 }}>🔒</span>;
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
  const tabs = getTabs();
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

  let sortedGroups = groups.filter(g => !g.deleted);
  if (sortOrder === 'alphabetical') {
    sortedGroups = [...sortedGroups].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'lastUsed') {
    sortedGroups = [...sortedGroups].sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
  } else {
    sortedGroups = [...sortedGroups].sort((a, b) => a.order - b.order);
  }

  const currentWindowId = 'window-1'; // Mocked for now

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
        <Button.Root type="submit" disabled={creating || !newGroupName.trim()}>Add</Button.Root>
      </form>
      <Button.Root onClick={handleSaveWindowAsGroup} style={{ marginBottom: 16, width: '100%' }}>
        Save Current Window as Group
      </Button.Root>
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
      <ul>
        {groups.length === 0 && <li>No groups found.</li>}
        {sortedGroups.map((group, idx) => {
          const isExpanded = expandedGroups.includes(group.id);
          const IconComponent = group.icon ? LucideIcons[group.icon.toLowerCase()] : Folder; // Default to Folder
          const isEditing = editingId === group.id;
          const isSelecting = selectorId === group.id;
          const isPendingDelete = pendingDeleteId === group.id;
          const isActiveElsewhere = isGroupActiveElsewhere(group.id, currentWindowId);

          return (
            <React.Fragment key={group.id}>
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
                onClick={() => !isEditing && !isPendingDelete && toggleExpand(group.id)}
              >
                <span style={{ marginRight: 8, cursor: 'grab' }} title="Drag to reorder">☰</span>
                <span style={{ marginRight: 8 }} onClick={e => { e.stopPropagation(); openSelector(group); }}>
                  {IconComponent ? <IconComponent size={16} style={{ color: group.color }} data-testid={`${group.icon?.toLowerCase()}-icon`} /> : group.icon || '📁'}
                </span>
                <span style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      value={editName}
                      autoFocus
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => saveEdit(group)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(group);
                        if (e.key === 'Escape') { setEditingId(null); setEditName(''); }
                      }}
                      style={{ width: '90%' }}
                    />
                  ) : (
                    group.name
                  )}
                </span>
                <span style={{ marginRight: 8 }}>({tabs.filter(t => t.groupId === group.id).length})</span>
                <span style={{ marginRight: 8 }} onClick={e => { e.stopPropagation(); startEditing(group); }}>
                  <Pencil size={14} style={{ cursor: 'pointer' }} title="Edit group name" />
                </span>
                <span style={{ marginRight: 8 }} onClick={e => { e.stopPropagation(); softDeleteGroup(group.id); setGroups(getGroups()); }}>
                  <Trash2 size={14} style={{ cursor: 'pointer', color: 'red' }} title="Delete group" />
                </span>
                {group.id === activeElsewhereId && <LockIcon />}
                <span style={{ marginLeft: 8 }} onClick={e => { e.stopPropagation(); handleOpenInNewWindow(group); }}>
                  <ExternalLink size={14} style={{ cursor: 'pointer' }} title="Open group in new window" />
                </span>
              </li>
              <Dialog.Root open={isSelecting} onOpenChange={open => setSelectorId(open ? group.id : null)}>
                <Dialog.Trigger asChild>
                  <li style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Color:</span>
                      {COLOR_OPTIONS.map(color => (
                        <span
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{
                            width: 18, height: 18, borderRadius: '50%', background: color,
                            border: selectedColor === color ? '2px solid #333' : '1px solid #ccc',
                            cursor: 'pointer', display: 'inline-block'
                          }}
                          title={color}
                        />
                      ))}
                      <span style={{ marginLeft: 12 }}>Icon:</span>
                      {ICON_OPTIONS.map(icon => {
                        const Icon = LucideIcons[icon];
                        return (
                          <span
                            key={icon}
                            onClick={() => setSelectedIcon(icon)}
                            style={{
                              border: selectedIcon === icon ? '2px solid #333' : '1px solid #ccc',
                              borderRadius: 4, padding: 2, marginRight: 2, cursor: 'pointer',
                              background: '#fff', display: 'inline-block'
                            }}
                            title={icon}
                          >
                            <Icon size={16} style={{ color: selectedColor }} />
                          </span>
                        );
                      })}
                      <Button.Root onClick={() => { saveSelector(group); setSelectorId(null); }} style={{ marginLeft: 8 }}>Save</Button.Root>
                      <Button.Root onClick={() => setSelectorId(null)} style={{ marginLeft: 4 }}>Cancel</Button.Root>
                    </div>
                  </li>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay />
                  <Dialog.Content>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Color:</span>
                      {COLOR_OPTIONS.map(color => (
                        <span
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{
                            width: 18, height: 18, borderRadius: '50%', background: color,
                            border: selectedColor === color ? '2px solid #333' : '1px solid #ccc',
                            cursor: 'pointer', display: 'inline-block'
                          }}
                          title={color}
                        />
                      ))}
                      <span style={{ marginLeft: 12 }}>Icon:</span>
                      {ICON_OPTIONS.map(icon => {
                        const Icon = LucideIcons[icon];
                        return (
                          <span
                            key={icon}
                            onClick={() => setSelectedIcon(icon)}
                            style={{
                              border: selectedIcon === icon ? '2px solid #333' : '1px solid #ccc',
                              borderRadius: 4, padding: 2, marginRight: 2, cursor: 'pointer',
                              background: '#fff', display: 'inline-block'
                            }}
                            title={icon}
                          >
                            <Icon size={16} style={{ color: selectedColor }} />
                          </span>
                        );
                      })}
                      <Button.Root onClick={() => { saveSelector(group); setSelectorId(null); }} style={{ marginLeft: 8 }}>Save</Button.Root>
                      <Button.Root onClick={() => setSelectorId(null)} style={{ marginLeft: 4 }}>Cancel</Button.Root>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              {isExpanded && (
                <li>
                  <TabList groupId={group.id} />
                </li>
              )}
            </React.Fragment>
          );
        })}
        {/* Render soft-deleted groups at the end */}
        {groups.filter(g => g.deleted).map(group => (
          <li key={group.id} style={{ opacity: 0.5, textDecoration: 'line-through', display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ flex: 1 }}>{group.name}</span>
                <span style={{ marginRight: 8 }} onClick={() => { restoreGroup(group.id); setGroups(getGroups()); }}>
                  <RotateCcw size={16} style={{ cursor: 'pointer' }} title="Restore group" />
                </span>
                <Dialog.Root open={isPendingDelete} onOpenChange={open => setPendingDeleteId(open ? group.id : null)}>
                  <Dialog.Trigger asChild>
                    <span style={{ marginRight: 8 }} onClick={() => { setPendingDeleteId(group.id); }}>
                      <Trash2 size={16} style={{ cursor: 'pointer', color: 'red' }} title="Confirm delete" />
                    </span>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay />
                    <Dialog.Content>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <span>Are you sure you want to delete this group?</span>
                        <Button.Root onClick={() => { deleteGroup(group.id); setGroups(getGroups()); setPendingDeleteId(null); }}>Confirm</Button.Root>
                        <Button.Root onClick={() => setPendingDeleteId(null)}>Cancel</Button.Root>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </li>
        ))}
      </ul>
    </>
  );
}