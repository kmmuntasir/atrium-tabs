import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BackupPreview from '../components/BackupPreview';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
describe('Backup Preview UI', () => {
  it('renders backup preview', () => {
    const data = { groups: [{ id: '1', name: 'Work', tabs: [] }] };
    render(<BackupPreview data={data} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });
  it('is accessible', async () => {
    const data = { groups: [{ id: '1', name: 'Work', tabs: [] }] };
    const { container } = render(<BackupPreview data={data} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});