# Test Plan for Atrium Tabs

## Overview
This document outlines the comprehensive test plan for the Atrium Tabs project. It covers test strategy, mapping of features to test cases, test types, tools, directory structure, code samples, and references to best practices.

---

## 1. Test Strategy

- **Test Types:**
  - Unit tests (data models, utility functions)
  - Component/UI tests (React components)
  - Integration tests (feature flows, data persistence)
  - Accessibility (a11y) tests
  - Edge case and regression tests
- **Frameworks:**
  - [Vitest](https://vitest.dev/) (test runner)
  - [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) (UI testing)
  - [axe-core](https://github.com/dequelabs/axe-core-npm) (accessibility)
- **Coverage Goal:**
  - 100% for data models and critical logic
  - High coverage for UI and user flows
  - Automated a11y checks for all interactive UI

---

## 2. Test Directory Structure

```
project-root/
  src/
    __tests__/
      group.model.test.ts
      tab.model.test.ts
      popup.ui.test.tsx
      group.list.test.tsx
      tab.list.test.tsx
      backup.preview.test.tsx
      group.management.test.tsx
  test/
    setup.ts
```

---

## 3. Mapping Features to Test Cases

| Feature/Module                | Test Case Doc                        | Test File(s)                        |
|------------------------------|--------------------------------------|-------------------------------------|
| Group Data Model             | test_cases/01_data_model.md           | group.model.test.ts                 |
| Tab Data Model               | test_cases/01_data_model.md           | tab.model.test.ts                   |
| Popup UI Scaffold            | test_cases/02_ui.md                   | popup.ui.test.tsx                   |
| Group List in Popup          | test_cases/02_ui.md                   | group.list.test.tsx                 |
| Expand/Collapse Group        | test_cases/02_ui.md                   | group.list.test.tsx                 |
| Backup Preview UI            | test_cases/02_ui.md                   | backup.preview.test.tsx              |
| UI Polish (Color/Icon/Toast) | test_cases/02_ui.md                   | popup.ui.test.tsx, group.list.test.tsx |
| Group Management Features    | test_cases/03_group_management.md     | group.management.test.tsx           |

---

## 4. Test Implementation Details

### 4.1. Data Model Tests
- **Location:** `src/__tests__/group.model.test.ts`, `src/__tests__/tab.model.test.ts`
- **Tools:** Vitest
- **Sample:**
```ts
import { describe, it, expect } from 'vitest';
import { Group } from '../group';

describe('Group Model', () => {
  it('should create a group with valid fields', () => {
    const group = new Group({ name: 'Work', color: '#fff', icon: '💼' });
    expect(group.name).toBe('Work');
    expect(group.color).toBe('#fff');
    expect(group.icon).toBe('💼');
    expect(group.id).toMatch(/[a-f0-9\-]{36}/);
  });
  // ...more cases from test_cases/01_data_model.md
});
```

### 4.2. UI/Component Tests
- **Location:** `src/__tests__/*.test.tsx`
- **Tools:** Vitest, @testing-library/react
- **Sample:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Popup from '../components/Popup';

describe('Popup UI', () => {
  it('renders group list on open', () => {
    render(<Popup />);
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });
  // ...more cases from test_cases/02_ui.md
});
```

### 4.3. Accessibility (a11y) Tests
- **Location:** In relevant UI/component test files
- **Tools:** axe-core, @testing-library/react
- **Sample:**
```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Popup from '../components/Popup';

expect.extend(toHaveNoViolations);

test('Popup is accessible', async () => {
  const { container } = render(<Popup />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 4.4. Integration & Edge Case Tests
- **Location:** In feature test files (e.g., group.management.test.tsx)
- **Sample:**
```ts
import { render, screen, fireEvent } from '@testing-library/react';
import GroupList from '../components/GroupList';

describe('Group Management', () => {
  it('allows creating and deleting groups', () => {
    render(<GroupList />);
    fireEvent.click(screen.getByText('Add Group'));
    expect(screen.getByText('New Group')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Delete Group'));
    expect(screen.queryByText('New Group')).not.toBeInTheDocument();
  });
  // ...more cases from test_cases/03_group_management.md
});
```

---

## 5. Test Setup
- **Polyfills:** `test/setup.ts` polyfills `ResizeObserver` for the test environment.
- **Configuration:** Ensure Vitest loads `test/setup.ts` via the `setupFiles` config in `vitest.config.ts`.
- **Sample config:**
```js
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    setupFiles: ['./test/setup.ts'],
    environment: 'jsdom',
  },
});
```

---

## 6. References & Best Practices
- [Vitest Docs](https://vitest.dev/guide/)
- [Testing Library Docs](https://testing-library.com/docs/)
- [Jest Axe (a11y)](https://github.com/nickcolley/jest-axe)
- [React Testing Best Practices](https://testing-library.com/docs/react-testing-library/examples/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/accessibility)

---

## 7. Test Execution & CI
- All tests must run and pass in CI (see `.github/workflows/` or CI config).
- Linting and type checks must also pass.
- Pull requests must not be merged unless all tests are green.

---

## 8. Future Work
- Expand test coverage as new features are added.
- Add E2E tests if/when a browser automation setup is introduced (e.g., Playwright).
- Regularly review and update test cases and this plan.