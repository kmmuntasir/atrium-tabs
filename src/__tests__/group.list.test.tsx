import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import GroupList from '../components/GroupList';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
describe('Group List', () => {
  it('renders add group input and button', () => {
    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    expect(screen.getByPlaceholderText('New group name')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
  it('is accessible', async () => {
    const { container } = render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});