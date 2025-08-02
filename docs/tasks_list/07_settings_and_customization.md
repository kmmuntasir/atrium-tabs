## Settings & Customization

### [ATRIUM-0036] Full-Page Settings Screen
**Description:**
Implement a full-page settings screen accessible from the popup.

**Acceptance Criteria:**
- Settings page opens in new tab.
- All settings sections present.
- Unit test: Renders without error.
- Integration test: Settings persist after change.

### [ATRIUM-0037] Theme Toggle (Light/Dark, Sync with Browser/System)
**Description:**
Allow toggling between light and dark themes, with option to sync with browser/system.

**Acceptance Criteria:**
- Theme toggle in settings.
- Sync option available.
- Unit test: Theme logic.
- Integration test: Theme persists and updates icon.

**Dependencies:** ATRIUM-0036

### [ATRIUM-0038] Extension Icon Updates with Theme
**Description:**
Update extension icon to match selected theme.

**Acceptance Criteria:**
- Icon updates on theme change.
- Unit test: Icon update logic.
- Integration test: Icon changes in browser.

**Dependencies:** ATRIUM-0037

### [ATRIUM-0039] Keyboard Shortcut Mapping UI
**Description:**
Implement UI for mapping keyboard shortcuts for group switching and other actions.

**Acceptance Criteria:**
- Shortcut mapping UI in settings.
- Shortcuts update and persist.
- Unit test: Mapping logic.
- Integration test: Shortcuts work in extension.

**Dependencies:** ATRIUM-0036

### [ATRIUM-0040] Default Hotkeys for Group Switching
**Description:**
Set up default hotkeys (Ctrl/Cmd+Shift+1-9) for group switching.

**Acceptance Criteria:**
- Default hotkeys work on install.
- Unit test: Hotkey logic.
- Integration test: Hotkeys switch groups in UI.

**Dependencies:** ATRIUM-0039

### [ATRIUM-0041] Toggle Lazy-Load/Eager-Load for Tabs
**Description:**
Allow toggling between lazy-load and eager-load for tabs, with warning about performance.

**Acceptance Criteria:**
- Toggle in settings.
- Warning shown for eager-load.
- Unit test: Load mode logic.
- Integration test: Tabs load per setting.

**Dependencies:** ATRIUM-0036

### [ATRIUM-0042] ARIA Labels and Keyboard Navigation for Accessibility
**Description:**
Add ARIA labels and keyboard navigation to all interactive UI elements, leveraging Radix UI's built-in accessibility features.

**Acceptance Criteria:**
- All UI elements have ARIA labels.
- Keyboard navigation works for all actions.
- Unit test: Accessibility checks.
- Integration test: Keyboard navigation in UI.

**Dependencies:** ATRIUM-0010