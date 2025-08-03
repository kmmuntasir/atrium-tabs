import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/storage/GroupStorage', () => ({
  getGroups: vi.fn(() => []),
}));

import App from '../../src/App';

describe('App', () => {
  it('renders without error', () => {
    render(<App />);
    expect(screen.getByText('Atrium Tabs')).toBeInTheDocument();
    expect(screen.getByText('No groups found. Create a new one!')).toBeInTheDocument();
  });
});