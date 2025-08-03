import React, { useEffect, useState } from 'react';
import { getGroups } from '../storage/GroupStorage';
import { TabStorage } from '../storage/TabStorage'; // Import the class
import { createGroup } from '../storage/GroupStorage'; // Import createGroup
import type { Group } from '../types/Group';
import type { Tab } from '../types/Tab';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState<string>(''); // State for new group name

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
      {groups.length === 0 ? (
        <p>No groups found. Create a new one!</p>
      ) : (
        groups.map(group => (
          <div key={group.uuid} className="group-item" style={{ borderLeft: `5px solid ${group.color}` }}>
            <h3 onClick={() => toggleGroupExpansion(group.uuid)} style={{ cursor: 'pointer' }}>
              <span className="group-icon" style={{ marginRight: '8px' }}>{group.icon}</span>
              {group.name} ({TabStorage.getTabsByGroupId(group.uuid).length})
              {expandedGroups.has(group.uuid) ? ' ▼' : ' ▶'}
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