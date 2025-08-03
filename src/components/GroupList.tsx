import React, { useEffect, useState } from 'react';
import { getGroups } from '../storage/GroupStorage';
import { TabStorage } from '../storage/TabStorage'; // Import the class
import type { Group } from '../types/Group';
import type { Tab } from '../types/Tab';

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  return (
    <div className="group-list">
      {groups.length === 0 ? (
        <p>No groups found. Create a new one!</p>
      ) : (
        groups.map(group => (
          <div key={group.uuid} className="group-item">
            <h3 onClick={() => toggleGroupExpansion(group.uuid)} style={{ cursor: 'pointer' }}>
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