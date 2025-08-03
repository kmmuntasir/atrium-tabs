import React, { useEffect, useState } from 'react';
import { getGroups } from '../storage/GroupStorage';
import type { Group } from '../types/Group';

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  return (
    <div className="group-list">
      {groups.length === 0 ? (
        <p>No groups found. Create a new one!</p>
      ) : (
        groups.map(group => (
          <div key={group.uuid} className="group-item">
            <h3>{group.name}</h3>
            {/* Tabs for this group will be displayed here later */}
          </div>
        ))
      )}
    </div>
  );
};

export default GroupList;