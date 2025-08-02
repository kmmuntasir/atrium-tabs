// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BackupPreview from '../src/components/BackupPreview';

const mockBackupData = {
  groups: [
    {
      id: 'backup-group-1',
      name: 'Backup Work Group',
      icon: '💼',
      tabs: [
        { id: 'bt1', url: 'http://backup-work1.com', title: 'Backup Work Tab 1', favicon: 'fav1.ico' },
        { id: 'bt2', url: 'http://backup-work2.com', title: 'Backup Work Tab 2', favicon: 'fav2.ico' },
      ],
    },
    {
      id: 'backup-group-2',
      name: 'Backup Personal Group',
      icon: '🏠',
      tabs: [
        { id: 'bt3', url: 'http://backup-personal1.com', title: 'Backup Personal Tab 1', favicon: 'fav3.ico' },
      ],
    },
  ],
};

describe('BackupPreview', () => {
  afterEach(cleanup);

  it('renders backup data with groups and tabs', () => {
    render(<BackupPreview data={mockBackupData} />);

    expect(screen.getByText('Backup Preview')).toBeDefined();
    expect(screen.getByText('This is a read-only preview of your backup data.')).toBeDefined();

    // Check group rendering
    expect(screen.getByText('Backup Work Group')).toBeDefined();
    expect(screen.getByText('Backup Personal Group')).toBeDefined();
    expect(screen.getByText('(2)')).toBeDefined(); // Tab count for Work Group
    expect(screen.getByText('(1)')).toBeDefined(); // Tab count for Personal Group

    // Tabs should initially be hidden
    expect(screen.queryByText('Backup Work Tab 1')).toBeNull();
    expect(screen.queryByText('Backup Personal Tab 1')).toBeNull();
  });

  it('expands and collapses groups to show tabs', () => {
    render(<BackupPreview data={mockBackupData} />);

    // Click to expand Backup Work Group
    fireEvent.click(screen.getByText('Backup Work Group'));
    expect(screen.getByText('Backup Work Tab 1')).toBeDefined();
    expect(screen.getByText('Backup Work Tab 2')).toBeDefined();
    expect(screen.queryByText('Backup Personal Tab 1')).toBeNull();

    // Click to collapse Backup Work Group
    fireEvent.click(screen.getByText('Backup Work Group'));
    expect(screen.queryByText('Backup Work Tab 1')).toBeNull();

    // Click to expand Backup Personal Group
    fireEvent.click(screen.getByText('Backup Personal Group'));
    expect(screen.getByText('Backup Personal Tab 1')).toBeDefined();
  });

  it('shows a message when no groups are in backup data', () => {
    render(<BackupPreview data={{ groups: [] }} />);
    expect(screen.getByText('No groups found in backup.')).toBeDefined();
  });

  // Test that elements are not interactive (e.g., links, buttons not present/disabled)
  it('does not enable interactive actions', () => {
    render(<BackupPreview data={mockBackupData} />);
    // Add assertions here if there were specific interactive elements to check
    // For now, we assume click handlers on li only expand/collapse, not navigate/edit
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});