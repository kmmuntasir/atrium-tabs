import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface BackupGroup {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  order?: number;
  lastActiveAt?: string;
  tabs: BackupTab[];
}

interface BackupTab {
  id: string;
  url: string;
  title: string;
  pinned?: boolean;
  favicon?: string;
  createdAt?: string;
}

interface BackupData {
  groups: BackupGroup[];
}

interface BackupPreviewProps {
  data: BackupData;
}

export default function BackupPreview({ data }: BackupPreviewProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <div style={{ width: 320, padding: 16 }}>
      <h2>Backup Preview</h2>
      <p style={{ fontSize: '0.8em', color: '#888', marginBottom: 16 }}>
        This is a read-only preview of your backup data.
      </p>
      {data.groups.length === 0 && <p>No groups found in backup.</p>}
      <ul>
        {data.groups.map(group => {
          const isExpanded = expandedGroups.includes(group.id);
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
                <span style={{ marginRight: 8 }}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span style={{ marginRight: 8 }}>{group.icon || '📁'}</span>
                <span style={{ flex: 1 }}>{group.name}</span>
                <span style={{ marginRight: 8 }}>({group.tabs.length})</span>
              </li>
              {isExpanded && (
                <ul style={{ listStyle: 'none', paddingLeft: 20, marginTop: 8 }}>
                  {group.tabs.length === 0 && (
                    <li style={{ fontSize: '0.8em', color: '#666' }}>No tabs in this group.</li>
                  )}
                  {group.tabs.map(tab => (
                    <li key={tab.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <img
                        src={tab.favicon || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}
                        alt="favicon"
                        style={{ width: 16, height: 16, marginRight: 8 }}
                      />
                      <span style={{ fontSize: '0.9em' }}>{tab.title || tab.url}</span>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
}