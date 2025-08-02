# Radix UI Test Migration Plan

This document outlines a comprehensive plan to migrate all UI tests in the codebase to be fully compatible with Radix UI primitives and best practices for accessibility, user interaction, and robust testing.

---

## 1. Environment Setup

### 1.1. Install Required Packages
- `@testing-library/user-event` (for realistic user interaction)
- Ensure all Radix UI primitives used in the codebase are installed (e.g., `@radix-ui/react-accordion`, `@radix-ui/react-dialog`, etc.)

```sh
npm install --save-dev @testing-library/user-event @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tooltip
```

### 1.2. Mock Browser APIs (e.g., ResizeObserver)
Radix UI uses ResizeObserver, which is not available in JSDOM. Add this to your test setup file (e.g., `test/setup.ts`):

```ts
// test/setup.ts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserver;
```

Update your Vitest config to include this setup file.

---

## 2. General Test Refactor Guidelines

- **Use `@testing-library/user-event`** for all user interactions (click, type, keyboard navigation, etc.) instead of `fireEvent`.
- **Prefer `getByRole`, `findByRole`, `getByLabelText`** over `getByTestId`, `getByTitle`, or `getByText` for queries.
- **Test overlays and popups** (Accordion, Dialog, Select, Tooltip) by simulating real user actions (mouse, keyboard).
- **Assert accessibility**: roles, labels, focus, keyboard navigation.
- **Use async queries** (`findBy*`) for overlays/popups that appear after user interaction.

---

## 3. File-by-File Migration Plan

### 3.1. `test/group-list.test.tsx`
- **Replace** all `fireEvent` with `userEvent`.
- **Replace** `getByTestId`, `getByTitle`, and `getByText` with `getByRole`, `getByLabelText`, or `findByRole`.
- **Accordion**: Use `userEvent.click` or `userEvent.keyboard('{Enter}')` on the trigger, assert expanded/collapsed state by checking for content.
- **Dialog/Tooltip**: Use `userEvent.click` or `userEvent.tab` to open, assert with `findByRole('dialog')` or `findByRole('tooltip')`.
- **Select**: Use `userEvent.click` on the trigger, then on the option, assert selected value.
- **Accessibility**: Add tests for keyboard navigation, focus management, and ARIA roles.
- **Remove** reliance on `data-testid` and `title` for queries.

### 3.2. `test/backup-preview.test.tsx`
- **Accordion**: Use `userEvent.click` or `userEvent.keyboard('{Enter}')` to expand/collapse groups.
- **Assert** group/tab visibility using `getByRole` or `findByRole`.
- **Accessibility**: Add tests for keyboard navigation and ARIA roles.

### 3.3. `test/popup.test.tsx`
- **Replace** `fireEvent` with `userEvent`.
- **Use** `getByRole` for headings, buttons, and group list.
- **Accessibility**: Add tests for keyboard navigation and focus.

### 3.4. `test/group.test.ts` & `test/tab.test.ts`
- **No UI**: No Radix-specific migration needed.

---

## 4. Radix-Specific Test Patterns

### 4.1. Accordion
```ts
import userEvent from '@testing-library/user-event';
const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: /work/i }));
expect(screen.getByText('Work Tab 1')).toBeInTheDocument();
```

### 4.2. Dialog
```ts
await user.click(screen.getByRole('button', { name: /edit/i }));
expect(await screen.findByRole('dialog')).toBeInTheDocument();
```

### 4.3. Select
```ts
await user.click(screen.getByRole('combobox'));
await user.click(screen.getByRole('option', { name: /alphabetical/i }));
expect(screen.getByRole('combobox')).toHaveValue('alphabetical');
```

### 4.4. Tooltip
```ts
await user.tab(); // Focus the trigger
expect(await screen.findByRole('tooltip')).toBeInTheDocument();
```

---

## 5. Accessibility & Keyboard Navigation
- **Add tests** for:
  - Tab order and focus management
  - Keyboard navigation for all Radix primitives
  - ARIA roles and accessible names

---

## 6. Example Test Snippet
```ts
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import GroupList from '../src/components/GroupList';

describe('GroupList (Radix UI)', () => {
  it('expands a group with keyboard', async () => {
    render(<GroupList />);
    const trigger = screen.getByRole('button', { name: /work/i });
    await userEvent.tab(); // Focus the trigger
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Work Tab 1')).toBeInTheDocument();
  });
});
```

---

## 7. Migration Checklist
- [ ] Add test setup for ResizeObserver and userEvent
- [ ] Refactor all UI tests to use userEvent and role-based queries
- [ ] Update all overlay/popup tests to use async queries and user interactions
- [ ] Add accessibility and keyboard navigation tests
- [ ] Remove reliance on data-testid and title for queries
- [ ] Document new test patterns for future contributors

---

## 8. References
- [Radix UI Testing Guide](https://www.radix-ui.com/primitives/docs/guides/testing)
- [React Testing Library Docs](https://testing-library.com/docs/)
- [Vitest Docs](https://vitest.dev/)
- [Mocking ResizeObserver for Radix](https://www.radix-ui.com/primitives/docs/guides/testing#mocking-resizeobserver)

---

## 9. Codebase Audit Notes
- No test setup file found: **Add `test/setup.ts` for ResizeObserver and userEvent**
- No use of `@testing-library/user-event`: **Switch from fireEvent to userEvent**
- No async queries (`findBy*`, `waitFor`): **Add for overlays/popups**
- Some tests use `getByTestId`, `getByTitle`, `getByText`: **Switch to role/label-based queries**
- No explicit accessibility or keyboard navigation tests: **Add coverage**
- Model tests (`group.test.ts`, `tab.test.ts`) do not require migration

---

## 10. Recommendations
- Use [React Testing Library Playground](https://testing-playground.com/) to discover best queries for Radix UI components.
- Regularly review and expand tests as Radix UI primitives or accessibility requirements evolve.
- Document new patterns in a CONTRIBUTING or test strategy doc for future maintainers.