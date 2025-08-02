import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BackupPreview from '../components/BackupPreview';
describe('Backup Preview UI', () => {
  it('renders backup preview', () => {
    const data = { groups: [{ id: '1', name: 'Work', tabs: [] }] };
    render(<BackupPreview data={data} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });
  // ...more cases from test_cases/02_ui.md
});