import React, { useEffect, useState } from 'react';
import { getGroups } from '../storage/GroupStorage';
import { TabStorage } from '../storage/TabStorage'; // Import the class
import { createGroup, updateGroup } from '../storage/GroupStorage'; // Import updateGroup
import type { Group } from '../types/Group';
import type { Tab } from '../types/Tab';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

declare const chrome: any; // Declare chrome for TypeScript

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState<string>(''); // State for new group name
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null); // State for inline editing
  const [editedGroupName, setEditedGroupName] = useState<string>(''); // State for edited group name

  useEffect(() => {
    setGroups(getGroups());
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
      color: '#007bff', // Default color
      icon: 'Folder', // Default icon
      tabs: [],
      createdAt: Date.now(),
    };

    createGroup(newGroup);
    setGroups(getGroups()); // Refresh groups
    setNewGroupName(''); // Clear input
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
      setGroups(getGroups()); // Refresh groups

      alert(`Group \"${newGroup.name}\" saved successfully with ${tabsToSave.length} tabs!`);
    } catch (error) {
      console.error('Error saving current window as group:', error);
      alert('Failed to save current window as group. Please ensure the extension has necessary permissions.');
    }
  };

  const handleEditGroupName = (group: Group) => {
    setEditingGroupId(group.uuid);
    setEditedGroupName(group.name);
  };

  const handleSaveEditedGroupName = (group: Group) => {
    if (editedGroupName.trim() === '') {
      alert('Group name cannot be empty!');
      return;
    }
    const updatedGroup = { ...group, name: editedGroupName.trim(), updatedAt: Date.now() };
    updateGroup(updatedGroup);
    setGroups(getGroups()); // Refresh groups
    setEditingGroupId(null); // Exit editing mode
    setEditedGroupName('');
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditedGroupName('');
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
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
      <div className="save-window-group-section">
        <button onClick={handleSaveCurrentWindowAsGroup}>Save Current Window as New Group</button>
      </div>
      {groups.length === 0 ? (
        <p>No groups found. Create a new one!</p>
      ) : (
        groups.map(group => (
          <div key={group.uuid} className="group-item" style={{ borderLeft: `5px solid ${group.color}` }}>
            <h3 onDoubleClick={() => handleEditGroupName(group)} style={{ cursor: 'pointer' }}>
              <span className="group-icon" style={{ marginRight: '8px' }}>{group.icon}</span>
              {editingGroupId === group.uuid ? (
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
              ) : (
                <>
                  {group.name} ({TabStorage.getTabsByGroupId(group.uuid).length})
                  <span onClick={() => toggleGroupExpansion(group.uuid)}>
                    {expandedGroups.has(group.uuid) ? ' ▼' : ' ▶'}
                  </span>
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