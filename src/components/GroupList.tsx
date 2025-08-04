import React, { useEffect, useState } from 'react';
import { getGroups, setActiveGroupForWindow, getActiveGroupForWindow, getWindowIdForActiveGroup, removeActiveGroupForWindow } from '../storage/GroupStorage';
import { TabStorage } from '../storage/TabStorage'; // Import the class
import { createGroup, updateGroup, deleteGroup, restoreGroup } from '../storage/GroupStorage'; // Import updateGroup
import type { Group } from '../types/Group';
import type { Tab } from '../types/Tab';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { Lock } from 'lucide-react'; // Import the Lock icon

declare const chrome: any; // Declare chrome for TypeScript

import * as Accordion from '@radix-ui/react-accordion';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, Pencil, MoveVertical, GripVertical, Settings, ArrowUpDown, List } from 'lucide-react';

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>(''); // State for new group name
  const [newGroupColor, setNewGroupColor] = useState<string>('#007bff'); // State for new group color
  const [newGroupIcon, setNewGroupIcon] = useState<string>('Folder'); // State for new group icon
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null); // State for inline editing
  const [editedGroupName, setEditedGroupName] = useState<string>(''); // State for edited group name
  const [editedGroupColor, setEditedGroupColor] = useState<string>('#007bff'); // State for edited group color
  const [editedGroupIcon, setEditedGroupIcon] = useState<string>('Folder'); // State for edited group icon
  const [currentWindowId, setCurrentWindowId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroupInCurrentWindow, setActiveGroupInCurrentWindow] = useState<string | null>(null);
  const [activeGroupsInOtherWindows, setActiveGroupsInOtherWindows] = useState<Set<string>>(new Set());

  const fetchGroups = () => {
    const allGroups = getGroups(true);
    setGroups(allGroups);
    if (currentWindowId !== null) {
      const activeInOtherWindows = new Set<string>();
      allGroups.forEach(group => {
        if (group.activeInWindowId !== undefined && group.activeInWindowId !== currentWindowId) {
          activeInOtherWindows.add(group.uuid);
        }
      });
      setActiveGroupsInOtherWindows(activeInOtherWindows);
    }
  };

  const initializeWindowAndGroup = async () => {
    if (chrome && chrome.windows) {
      const currentWindow = await chrome.windows.getCurrent();
      if (currentWindow && currentWindow.id) {
        setCurrentWindowId(currentWindow.id);
        const activeGroup = getActiveGroupForWindow(currentWindow.id);
        setActiveGroupInCurrentWindow(activeGroup || null);
        // Activate the last active group for this window if it exists
        if (activeGroup) {
          // Additional logic if needed when a group is already active
        }
        // After setting currentWindowId, fetch groups to update activeGroupsInOtherWindows
        fetchGroups(); 
      }
    }
  };

  useEffect(() => {
    fetchGroups(); // Initial fetch
    initializeWindowAndGroup();

    window.addEventListener('storage', fetchGroups);

    if (chrome && chrome.windows) {
      chrome.windows.onRemoved.addListener((windowId: number) => {
        removeActiveGroupForWindow(windowId);
        fetchGroups(); // Refresh groups to update UI
      });
      chrome.tabs.onActivated.addListener(fetchGroups); // Listen for tab changes
      chrome.tabs.onRemoved.addListener(fetchGroups); // Listen for tab removal
      chrome.tabs.onUpdated.addListener(fetchGroups); // Listen for tab updates
    }

    return () => {
      window.removeEventListener('storage', fetchGroups);
      if (chrome && chrome.windows) {
        chrome.tabs.onActivated.removeListener(fetchGroups);
        chrome.tabs.onRemoved.removeListener(fetchGroups);
        chrome.tabs.onUpdated.removeListener(fetchGroups);
        // Need to remove the specific listener if possible, or handle cleanup differently for windows.onRemoved
      }
    };
  }, [currentWindowId]); // Rerun effect when currentWindowId is set

  const handleCreateGroup = () => {
    if (newGroupName.trim() === '') {
      alert('Group name cannot be empty!');
      return;
    }

    const newGroup: Group = {
      uuid: uuidv4(),
      name: newGroupName,
      color: newGroupColor,
      icon: newGroupIcon,
      tabs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: groups.length,
      lastActiveAt: Date.now(),
      isDeleted: false,
    };

    createGroup(newGroup);
    setGroups(getGroups(true)); // Refresh groups
    setNewGroupName(''); // Clear input
    setNewGroupColor('#007bff'); // Reset color
    setNewGroupIcon('Folder'); // Reset icon
  };

  const handleSaveCurrentWindowAsGroup = async () => {
    try {
      const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });

      if (currentWindowTabs.length === 0) {
        alert('Current window has no tabs to save!');
        return;
      }

      const newGroupTabs: Tab[] = currentWindowTabs.map((tab: any) => ({
        uuid: uuidv4(),
        groupId: '', // Will be set after group creation
        title: tab.title || 'Untitled',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl || '',
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
        order: 0,
        isPinned: tab.pinned,
        isOpen: true,
      }));

      const newGroup: Group = {
        uuid: uuidv4(),
        name: `Window ${currentWindowId} (${newGroupTabs.length} tabs)`,
        color: '#007bff', // Default color
        icon: 'Folder', // Default icon
        tabs: newGroupTabs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: groups.length,
        lastActiveAt: Date.now(),
        isDeleted: false,
      };

      createGroup(newGroup);
      setGroups(getGroups(true)); // Refresh groups
      alert('Current window saved as a new group!');
    } catch (error) {
      console.error('Error saving current window as group:', error);
      alert('Failed to save current window as a group.');
    }
  };

  const handleEditGroup = (group: Group) => {
    if (activeGroupsInOtherWindows.has(group.uuid)) {
      return; // Do not allow editing if group is active in another window
    }
    setEditingGroupId(group.uuid);
    setEditedGroupName(group.name);
    setEditedGroupColor(group.color);
    setEditedGroupIcon(group.icon);
  };

  const handleSaveEditedGroup = (group: Group) => {
    if (editedGroupName.trim() === '') {
      alert('Group name cannot be empty!');
      return;
    }
    const updatedGroup: Group = {
      ...group,
      name: editedGroupName,
      color: editedGroupColor,
      icon: editedGroupIcon,
    };
    updateGroup(updatedGroup);
    setGroups(getGroups(true)); // Refresh groups
    setEditingGroupId(null); // Exit editing mode
  };

  const handleDeleteGroup = (uuid: string) => {
    if (activeGroupsInOtherWindows.has(uuid)) {
      alert('Cannot delete a group that is active in another window.');
      return; // Do not allow deletion if group is active in another window
    }
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroup(uuid);
      setGroups(getGroups(true)); // Refresh groups
    }
  };

  const handleDeleteGroupAndKeepTabs = (uuid: string) => {
    // TODO: Implement this function
    alert('Not implemented yet');
  };

  const handleRestoreGroup = (uuid: string) => {
    restoreGroup(uuid);
    setGroups(getGroups(true)); // Refresh groups
  };

  const handleOpenGroupInNewWindow = async (group: Group) => {
    if (activeGroupsInOtherWindows.has(group.uuid)) {
      alert('This group is currently active in another window and cannot be opened.');
      return; // Do not allow opening if group is active in another window
    }
    if (group.tabs && group.tabs.length > 0) {
      const urls = group.tabs.map(tab => tab.url);
      try {
        const newWindow = await chrome.windows.create({ url: urls[0], focused: true });
        if (newWindow && newWindow.id) {
          setActiveGroupForWindow(newWindow.id, group.uuid);
          // Open remaining tabs
          for (let i = 1; i < urls.length; i++) {
            await chrome.tabs.create({ windowId: newWindow.id, url: urls[i], pinned: group.tabs[i].isPinned });
          }
          alert(`Group "${group.name}" opened in a new window!`);
          fetchGroups(); // Refresh groups to update UI
        }
      } catch (error) {
        console.error('Error opening group in new window:', error);
        alert('Failed to open group in a new window.');
      }
    } else {
      alert('This group has no tabs to open!');
    }
  };

  const handleActivateGroup = async (group: Group) => {
    if (activeGroupsInOtherWindows.has(group.uuid)) {
      alert('This group is currently active in another window and cannot be activated.');
      return; // Do not allow activation if group is active in another window
    }

    if (currentWindowId === null) {
      console.error('Current window ID is not set.');
      alert('Cannot activate group: window ID not found.');
      return;
    }

    // Deactivate the currently active group in this window if any
    const currentlyActiveGroupInWindow = getActiveGroupForWindow(currentWindowId);
    if (currentlyActiveGroupInWindow) {
      setActiveGroupForWindow(currentWindowId, null);
    }

    // Set the selected group as active in the current window
    setActiveGroupForWindow(currentWindowId, group.uuid);
    setActiveGroupInCurrentWindow(group.uuid);
    fetchGroups(); // Refresh groups to update UI

    if (group.tabs && group.tabs.length > 0) {
      try {
        const currentWindowTabs = await chrome.tabs.query({ windowId: currentWindowId });

        // Close all existing tabs in the current window except pinned ones
        for (const tab of currentWindowTabs) {
          if (!tab.pinned) {
            await chrome.tabs.remove(tab.id);
          }
        }

        // Open tabs from the selected group
        for (const tab of group.tabs) {
          await chrome.tabs.create({ url: tab.url, active: false, pinned: tab.isPinned });
        }
        alert(`Group "${group.name}" activated!`);
      } catch (error) {
        console.error('Error activating group:', error);
        alert('Failed to activate group.');
      }
    } else {
      // If the group has no tabs, open a new empty tab
      try {
        const currentWindowTabs = await chrome.tabs.query({ windowId: currentWindowId });
        for (const tab of currentWindowTabs) {
          if (!tab.pinned) {
            await chrome.tabs.remove(tab.id);
          }
        }
        await chrome.tabs.create({ active: true }); // Open a new blank tab
        alert(`Group "${group.name}" activated with a new empty tab!`);
      } catch (error) {
        console.error('Error opening new tab for empty group:', error);
        alert('Failed to open new tab.');
      }
    }
  };

  return (
    <div className="group-list-container p-2 bg-gray-100">
      <div className="search-bar mb-2">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-1 border border-gray-300 rounded"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <Accordion.Root type="single" collapsible className="w-full">
        {groups.filter(group => !group.isDeleted && group.name.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
          <Accordion.Item key={group.uuid} value={group.uuid} className="border-t border-gray-300">
            <Accordion.Header>
              <Accordion.Trigger className={`w-full p-2 text-left flex justify-between items-center ${group.uuid === activeGroupInCurrentWindow ? 'bg-blue-200' : ''}`}>
                <span>{group.name} ({group.tabs.length})</span>
                <div className="flex items-center space-x-1">
                  <button className="p-1" onClick={() => handleEditGroup(group)} aria-label="Edit group">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="p-1" onClick={() => handleDeleteGroup(group.uuid)} aria-label="Delete group">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-1" aria-label="Close group">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="p-2 bg-white">
              <ul className="space-y-0.5">
                {group.tabs.map((tab, index) => (
                  <li key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 cursor-move" />
                      {tab.favIconUrl && <img src={tab.favIconUrl} alt="Favicon" className="w-4 h-4" />}
                      <a href={tab.url} target="_blank" rel="noopener noreferrer" className="link link-hover">
                        {tab.title}
                      </a>
                    </div>
                    <button className="p-0.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200">
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <div className="mt-2">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button className="w-full p-2 border-t border-b border-gray-300 bg-gray-100 hover:bg-gray-200">
              Create a new group
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded">
              <Dialog.Title>Create New Group</Dialog.Title>
              <div className="mt-4 flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="New group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
                <input
                  type="color"
                  value={newGroupColor}
                  onChange={e => setNewGroupColor(e.target.value)}
                  className="input input-bordered w-16"
                />
                <select
                  value={newGroupIcon}
                  onChange={e => setNewGroupIcon(e.target.value)}
                  className="select select-bordered"
                >
                  <option value="Folder">Folder</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Travel">Travel</option>
                  <option value="Code">Code</option>
                  <option value="Game">Game</option>
                  <option value="Music">Music</option>
                  <option value="Read">Read</option>
                </select>
                <button onClick={handleCreateGroup} className="btn btn-primary">
                  Create Group
                </button>
              </div>
              <Dialog.Close asChild>
                <button className="absolute top-2 right-2">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <Toolbar.Root className="flex items-center justify-between mt-2 p-2 border-t border-gray-300">
        <button className="p-1" onClick={() => handleDeleteGroupAndKeepTabs(activeGroupInCurrentWindow || '')}>
          Delete current group and keep tabs open
        </button>
        <div className="flex items-center">
          <button className="p-1" aria-label="Group manager">
            <List className="h-4 w-4" />
          </button>
          <button className="p-1" aria-label="Reorder groups">
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button className="p-1" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </Toolbar.Root>
    </div>
  );
};

export default GroupList;