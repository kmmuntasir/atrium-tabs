import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Popup from '../components/Popup';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
describe('Popup UI', () => {
  it('renders popup heading', () => {
    render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );
    expect(screen.getByText('Atrium Tabs')).toBeInTheDocument();
  });
  it('is accessible', async () => {
    const { container } = render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});