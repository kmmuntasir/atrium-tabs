import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import GroupList from '../components/GroupList';
describe('Group Management', () => {
  it('allows creating a group', async () => {
    render(
      <Tooltip.Provider>
        <GroupList />
      </Tooltip.Provider>
    );
    const input = screen.getByPlaceholderText('New group name');
    fireEvent.change(input, { target: { value: 'Test Group' } });
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(input).toHaveValue(''); // input is cleared after add
    });
    expect(await screen.findByText('Test Group')).toBeInTheDocument();
  });
  // ...more cases from test_cases/03_group_management.md
});