// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Popup from '../src/components/Popup';

// Basic test to ensure Popup renders

describe('Popup', () => {
  it('renders without error and shows placeholder groups', () => {
    render(<Popup />);
    expect(screen.getByText('Atrium Tabs')).toBeDefined();
    expect(screen.getByText('Group 1 (placeholder)')).toBeDefined();
    expect(screen.getByText('Group 2 (placeholder)')).toBeDefined();
    expect(screen.getByText('Group 3 (placeholder)')).toBeDefined();
  });
});