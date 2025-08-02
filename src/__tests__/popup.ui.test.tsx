import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Popup from '../components/Popup';
describe('Popup UI', () => {
  it('renders popup heading', () => {
    render(
      <Tooltip.Provider>
        <Popup />
      </Tooltip.Provider>
    );
    expect(screen.getByText('Atrium Tabs')).toBeInTheDocument();
  });
  // ...more cases from test_cases/02_ui.md
});