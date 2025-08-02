import React, { useState } from 'react';
import { getGroups, Group } from '../group';
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
  Globe
} from 'lucide-react';
import TabList from './TabList';

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
  return <span title="Active elsewhere" style={{ marginLeft: 8 }}>🔒</span>;
}

export default function GroupList() {
  const groups: Group[] = getGroups();
  const tabs = getTabs();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('atrium_expanded_groups');
    return saved ? JSON.parse(saved) : [];
  });

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

  return (
    <ul>
      {groups.length === 0 && <li>No groups found.</li>}
      {groups.map(group => {
        const isExpanded = expandedGroups.includes(group.id);
        const IconComponent = group.icon ? LucideIcons[group.icon.toLowerCase()] : Folder; // Default to Folder

        return (
          <React.Fragment key={group.id}>
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
                cursor: 'pointer',
              }}
              onClick={() => toggleExpand(group.id)}
            >
              <span style={{ marginRight: 8 }}>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
              <span style={{ marginRight: 8 }}>{IconComponent ? <IconComponent size={16} style={{ color: group.color }} data-testid={`${group.icon?.toLowerCase()}-icon`} /> : group.icon || '📁'}</span>
              <span style={{ flex: 1 }}>{group.name}</span>
              <span style={{ marginRight: 8 }}>({tabs.filter(t => t.groupId === group.id).length})</span>
              {group.id === activeElsewhereId && <LockIcon />}
            </li>
            {isExpanded && (
              <li>
                <TabList groupId={group.id} />
              </li>
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );
}