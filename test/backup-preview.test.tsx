// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders backup data with groups and tabs', async () => {
    render(<BackupPreview data={mockBackupData} />);

    expect(await screen.findByText('Backup Preview')).toBeDefined();
    expect(await screen.findByText('This is a read-only preview of your backup data.')).toBeDefined();

    // Check group rendering
    expect(await screen.findByText('Backup Work Group')).toBeDefined();
    expect(await screen.findByText('Backup Personal Group')).toBeDefined();
    expect(await screen.findByText('(2)')).toBeDefined(); // Tab count for Work Group
    expect(await screen.findByText('(1)')).toBeDefined(); // Tab count for Personal Group

    // Tabs should initially be hidden
    expect(screen.queryByText('Backup Work Tab 1')).toBeNull();
    expect(screen.queryByText('Backup Personal Tab 1')).toBeNull();
  });

  it('expands and collapses groups to show tabs', async () => {
    render(<BackupPreview data={mockBackupData} />);

    // Click to expand Backup Work Group
    await userEvent.click(screen.getByText('Backup Work Group'));
    expect(await screen.findByText('Backup Work Tab 1')).toBeDefined();
    expect(await screen.findByText('Backup Work Tab 2')).toBeDefined();
    expect(screen.queryByText('Backup Personal Tab 1')).toBeNull();

    // Click to collapse Backup Work Group
    await userEvent.click(screen.getByText('Backup Work Group'));
    expect(screen.queryByText('Backup Work Tab 1')).toBeNull();

    // Click to expand Backup Personal Group
    await userEvent.click(screen.getByText('Backup Personal Group'));
    expect(await screen.findByText('Backup Personal Tab 1')).toBeDefined();
  });

  it('shows a message when no groups are in backup data', async () => {
    render(<BackupPreview data={{ groups: [] }} />);
    expect(await screen.findByText('No groups found in backup.')).toBeDefined();
  });

  // Test that elements are not interactive (e.g., links, buttons not present/disabled)
  it('does not enable interactive actions', async () => {
    render(<BackupPreview data={mockBackupData} />);
    // Add assertions here if there were specific interactive elements to check
    // For now, we assume click handlers on li only expand/collapse, not navigate/edit
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});