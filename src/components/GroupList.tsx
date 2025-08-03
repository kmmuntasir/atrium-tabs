import React, { useEffect, useState } from 'react';
import { getGroups, setActiveGroupForWindow, getActiveGroupForWindow, getWindowIdForActiveGroup, removeActiveGroupForWindow } from '../storage/GroupStorage';
import { TabStorage } from '../storage/TabStorage'; // Import the class
import { createGroup, updateGroup, deleteGroup, restoreGroup } from '../storage/GroupStorage'; // Import updateGroup
import type { Group } from '../types/Group';
import type { Tab } from '../types/Tab';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

declare const chrome: any; // Declare chrome for TypeScript

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState<string>(''); // State for new group name
  const [newGroupColor, setNewGroupColor] = useState<string>('#007bff'); // State for new group color
  const [newGroupIcon, setNewGroupIcon] = useState<string>('Folder'); // State for new group icon
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null); // State for inline editing
  const [editedGroupName, setEditedGroupName] = useState<string>(''); // State for edited group name
  const [editedGroupColor, setEditedGroupColor] = useState<string>('#007bff'); // State for edited group color
  const [editedGroupIcon, setEditedGroupIcon] = useState<string>('Folder'); // State for edited group icon
  const [currentWindowId, setCurrentWindowId] = useState<number | null>(null);
  const [activeGroupInCurrentWindow, setActiveGroupInCurrentWindow] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = () => {
      setGroups(getGroups(true));
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
            // Add logic here to open tabs for the activeGroup if needed on load
          }
        }
      }
    };

    fetchGroups(); // Initial fetch
    initializeWindowAndGroup();

    window.addEventListener('storage', fetchGroups);

    if (chrome && chrome.windows) {
      chrome.windows.onRemoved.addListener((windowId: number) => {
        removeActiveGroupForWindow(windowId);
        fetchGroups(); // Refresh groups to update UI
      });
    }

    return () => {
      window.removeEventListener('storage', fetchGroups);
      if (chrome && chrome.windows) {
        // Need to remove the specific listener if possible, or handle cleanup differently
      }
    };
  }, []);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

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
        alert('No tabs found in the current window.');
        return;
      }

      const newGroupNamePrompt = prompt('Enter a name for the new group:', 'My New Group');
      if (!newGroupNamePrompt || newGroupNamePrompt.trim() === '') {
        alert('Group name cannot be empty.');
        return;
      }

      const newGroup: Group = {
        uuid: uuidv4(),
        name: newGroupNamePrompt.trim(),
        color: '#ffc107', // Another default color
        icon: 'Window', // Another default icon
        tabs: [],
        createdAt: Date.now(),
      };

      const tabsToSave: Tab[] = currentWindowTabs.map((chromeTab: any) => ({
        uuid: uuidv4(),
        groupId: newGroup.uuid,
        url: chromeTab.url,
        title: chromeTab.title,
        pinned: chromeTab.pinned,
        faviconUrl: chromeTab.favIconUrl,
        createdAt: Date.now(),
      }));

      createGroup(newGroup);
      TabStorage.saveTabs(tabsToSave); // Save all associated tabs
      setGroups(getGroups(true)); // Refresh groups

      alert(`Group \"${newGroup.name}\" saved successfully with ${tabsToSave.length} tabs!`);
    } catch (error) {
      console.error('Error saving current window as group:', error);
      alert('Failed to save current window as group. Please ensure the extension has necessary permissions.');
    }
  };

  const handleEditGroupName = (group: Group) => {
    setEditingGroupId(group.uuid);
    setEditedGroupName(group.name);
    setEditedGroupColor(group.color);
    setEditedGroupIcon(group.icon);
  };

  const handleSaveEditedGroupName = (group: Group) => {
    if (editedGroupName.trim() === '') {
      alert('Group name cannot be empty!');
      return;
    }
    const updatedGroup = { ...group, name: editedGroupName.trim(), color: editedGroupColor, icon: editedGroupIcon, updatedAt: Date.now() };
    updateGroup(updatedGroup);
    setGroups(getGroups(true)); // Refresh groups
    setEditingGroupId(null); // Exit editing mode
    setEditedGroupName('');
    setEditedGroupColor('#007bff'); // Reset color
    setEditedGroupIcon('Folder'); // Reset icon
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditedGroupName('');
    setEditedGroupColor('#007bff'); // Reset color
    setEditedGroupIcon('Folder'); // Reset icon
  };

  const handleGroupClick = async (group: Group) => {
    if (!currentWindowId) {
      console.warn('Current window ID not available.');
      return;
    }

    const windowIdHoldingGroup = getWindowIdForActiveGroup(group.uuid);

    if (windowIdHoldingGroup && windowIdHoldingGroup !== currentWindowId) {
      alert(`This group is already active in another window (Window ID: ${windowIdHoldingGroup}).`);
      return;
    }

    // Deactivate the currently active group in this window, if any
    const previouslyActiveGroupInWindow = getActiveGroupForWindow(currentWindowId);
    if (previouslyActiveGroupInWindow) {
      // Logic to close tabs of the previously active group
      const tabsToClose = (await chrome.tabs.query({ windowId: currentWindowId })).filter((tab: any) => TabStorage.getTabsByGroupId(previouslyActiveGroupInWindow).some(gTab => gTab.url === tab.url));
      if (tabsToClose.length > 0) {
        await chrome.tabs.remove(tabsToClose.map((tab: any) => tab.id));
      }
    }

    // Activate the new group in the current window
    setActiveGroupForWindow(currentWindowId, group.uuid);
    setActiveGroupInCurrentWindow(group.uuid);

    // Open tabs for the newly active group
    const tabsToOpen = TabStorage.getTabsByGroupId(group.uuid);
    for (const tab of tabsToOpen) {
      await chrome.tabs.create({ url: tab.url, active: !tab.pinned }); // Open non-pinned tabs in background
    }

    // Close the current popup window
    window.close();
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? All associated tabs will also be lost.')) {
      deleteGroup(groupId);
      setGroups(getGroups(true)); // Refresh groups, including deleted ones
    }
  };

  const handleRestoreGroup = (groupId: string) => {
    restoreGroup(groupId);
    setGroups(getGroups(true)); // Refresh groups, including deleted ones
  };

  const handleOpenGroupInNewWindow = async (group: Group) => {
    try {
      const newWindow = await chrome.windows.create({
        url: TabStorage.getTabsByGroupId(group.uuid).map(tab => tab.url).join(','),
        incognito: false, // Or true for incognito
        type: 'normal',
      });

      if (newWindow && newWindow.id) {
        setActiveGroupForWindow(newWindow.id, group.uuid);
        setActiveGroupInCurrentWindow(group.uuid);

        const tabsToOpen = TabStorage.getTabsByGroupId(group.uuid);
        for (const tab of tabsToOpen) {
          await chrome.tabs.create({ url: tab.url, active: !tab.pinned });
        }
        alert(`Group \"${group.name}\" opened in a new window (Window ID: ${newWindow.id}).`);
      } else {
        alert('Failed to open group in a new window.');
      }
    } catch (error) {
      console.error('Error opening group in new window:', error);
      alert('Failed to open group in a new window. Please ensure the extension has necessary permissions.');
    }
  };

  return (
    <div className="group-list">
      <div className="create-group-section">
        <input
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <input
          type="color"
          value={newGroupColor}
          onChange={(e) => setNewGroupColor(e.target.value)}
        />
        <select value={newGroupIcon} onChange={(e) => setNewGroupIcon(e.target.value)}>
          <option value="Folder">Folder</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Travel">Travel</option>
          <option value="Education">Education</option>
        </select>
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
      <div className="save-window-group-section">
        <button onClick={handleSaveCurrentWindowAsGroup}>Save Current Window as New Group</button>
      </div>
      {groups.length === 0 ? (
        <p>No groups found. Create a new one!</p>
      ) : (
        groups.map(group => (
          <div key={group.uuid} className={`group-item ${group.isDeleted ? 'deleted' : ''}`} style={{ borderLeft: `5px solid ${group.color}` }}>
            <h3 onDoubleClick={() => handleEditGroupName(group)} style={{ cursor: 'pointer' }}>
              <span className="group-icon" style={{ marginRight: '8px' }}>{group.icon}</span>
              {editingGroupId === group.uuid ? (
                <>
                  <input
                    type="text"
                    value={editedGroupName}
                    onChange={(e) => setEditedGroupName(e.target.value)}
                    onBlur={() => handleSaveEditedGroupName(group)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEditedGroupName(group);
                      }
                    }}
                    autoFocus
                  />
                  <input
                    type="color"
                    value={editedGroupColor}
                    onChange={(e) => setEditedGroupColor(e.target.value)}
                  />
                  <select value={editedGroupIcon} onChange={(e) => setEditedGroupIcon(e.target.value)}>
                    <option value="Folder">Folder</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Travel">Travel</option>
                    <option value="Education">Education</option>
                  </select>
                  <button onClick={() => handleSaveEditedGroupName(group)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  {group.name} ({TabStorage.getTabsByGroupId(group.uuid).length})
                  {getWindowIdForActiveGroup(group.uuid) && getWindowIdForActiveGroup(group.uuid) !== currentWindowId && (
                    <span className="lock-icon" title={`Active in Window ID: ${getWindowIdForActiveGroup(group.uuid)}`}> 🔒</span>
                  )}
                  <span onClick={() => toggleGroupExpansion(group.uuid)}>
                    {expandedGroups.has(group.uuid) ? ' ▼' : ' ▶'}
                  </span>
                  {group.isDeleted ? (
                    <button onClick={() => handleRestoreGroup(group.uuid)}>Restore</button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleGroupClick(group)}
                        disabled={!!(getWindowIdForActiveGroup(group.uuid) && getWindowIdForActiveGroup(group.uuid) !== currentWindowId)}
                        title={getWindowIdForActiveGroup(group.uuid) && getWindowIdForActiveGroup(group.uuid) !== currentWindowId ? `Active in Window ID: ${getWindowIdForActiveGroup(group.uuid)}` : ''}
                      >
                        Activate
                      </button>
                      <button onClick={() => handleDeleteGroup(group.uuid)} className="delete-button">Delete</button>
                      <button onClick={() => handleOpenGroupInNewWindow(group)} className="open-new-window-button">Open in New Window</button>
                    </>
                  )}
                </>
              )}
            </h3>
            {expandedGroups.has(group.uuid) && (
              <div className="tab-list">
                {TabStorage.getTabsByGroupId(group.uuid).map(tab => (
                  <div key={tab.uuid} className="tab-item">
                    <img src={tab.faviconUrl} alt="favicon" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    <span>{tab.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GroupList;