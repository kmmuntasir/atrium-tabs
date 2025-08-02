## Accessibility & Onboarding

### [ATRIUM-0055] High-Contrast Theme (Light Mode)
**Description:**
Implement a high-contrast theme for light mode.

**Acceptance Criteria:**
- High-contrast toggle in settings.
- UI updates to high-contrast palette.
- Unit test: Theme logic.
- Integration test: UI updates on toggle.

**Dependencies:** ATRIUM-0037

### [ATRIUM-0056] Color-Blind Shape Badge Next to Group Icon
**Description:**
Add a shape badge next to each group icon for color-blind accessibility.

**Acceptance Criteria:**
- Shape badge cycles through 6 shapes.
- ARIA label present.
- Unit test: Badge logic.
- Integration test: Badge appears in UI.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0057] Automated Accessibility and UI Tests
**Description:**
Implement automated accessibility and UI tests for all major flows.

**Acceptance Criteria:**
- Automated tests run in CI.
- Accessibility violations are caught.
- Unit test: N/A
- Integration test: All major flows covered.

**Dependencies:** ATRIUM-0010, ATRIUM-0042

### [ATRIUM-0058] 3-Step Onboarding Carousel with Screenshots/GIFs
**Description:**
Implement a 3-step onboarding carousel with screenshots/GIFs, utilizing Radix UI components for structure and interactivity.

**Acceptance Criteria:**
- Carousel appears on first run.
- Screenshots/GIFs for each step.
- Unit test: Carousel logic.
- Integration test: Carousel appears and can be completed/skipped.

**Dependencies:** ATRIUM-0036

### [ATRIUM-0059] Show “Hotkeys Active” Toast After Onboarding
**Description:**
Show a toast notification after onboarding is completed or skipped.

**Acceptance Criteria:**
- Toast appears for 2 seconds after onboarding.
- Unit test: Toast logic.
- Integration test: Toast appears after onboarding.

**Dependencies:** ATRIUM-0058