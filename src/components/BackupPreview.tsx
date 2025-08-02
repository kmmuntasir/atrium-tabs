import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';

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

  return (
    <div style={{ width: 320, padding: 16 }}>
      <h2>Backup Preview</h2>
      <p style={{ fontSize: '0.8em', color: '#888', marginBottom: 16 }}>
        This is a read-only preview of your backup data.
      </p>
      {data.groups.length === 0 && <p>No groups found in backup.</p>}
      <Accordion.Root type="multiple" value={expandedGroups} onValueChange={setExpandedGroups}>
        {data.groups.map(group => (
          <Accordion.Item value={group.id} key={group.id}>
            <Accordion.Trigger asChild>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <span style={{ marginRight: 8 }}>
                  {expandedGroups.includes(group.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span style={{ marginRight: 8 }}>{group.icon || '📁'}</span>
                <span style={{ flex: 1 }}>{group.name}</span>
                <span style={{ marginRight: 8 }}>({group.tabs.length})</span>
              </li>
            </Accordion.Trigger>
            <Accordion.Content asChild>
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
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}