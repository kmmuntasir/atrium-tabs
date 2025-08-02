## Group Management

### [ATRIUM-0015] Create New Group (Manual Name Input)
**Description:**
Allow users to create a new group by entering a name.

**Acceptance Criteria:**
- Input field for group name.
- New group appears in list after creation.
- Unit test: Group creation logic.
- Integration test: Group persists after reload.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0016] Save Current Window as New Group
**Description:**
Implement feature to save the current window as a new group (auto-naming, color assignment).

**Acceptance Criteria:**
- Button to save current window as group.
- Auto-names and assigns color.
- Unit test: Window capture logic.
- Integration test: Tabs from window appear in new group.

**Dependencies:** ATRIUM-0015

### [ATRIUM-0017] Edit Group Name (Inline Editing)
**Description:**
Allow inline editing of group names in the UI.

**Acceptance Criteria:**
- Edit icon triggers inline edit.
- Name updates on Enter.
- Unit test: Edit logic.
- Integration test: Name persists after reload.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0018] Assign Color and Icon to Group (Selector UI)
**Description:**
Implement UI for selecting a color and icon for each group.

**Acceptance Criteria:**
- Color/icon selector opens from group icon.
- Selection updates group.
- Unit test: Selector logic.
- Integration test: Color/icon persist after reload.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0019] Delete Group (Soft Delete, Confirmation)
**Description:**
Implement soft delete with confirmation for groups.

**Acceptance Criteria:**
- First click grays out row, shows restore icon.
- Second click confirms deletion.
- Unit test: Delete/restore logic.
- Integration test: Group removed from list and storage.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0020] Restore Closed Group
**Description:**
Allow restoring a closed group from soft delete state.

**Acceptance Criteria:**
- Restore icon brings group back to list.
- Unit test: Restore logic.
- Integration test: Group reappears in list and storage.

**Dependencies:** ATRIUM-0019

### [ATRIUM-0021] Manual Group Reordering (Drag-and-Drop)
**Description:**
Enable drag-and-drop reordering of groups (manual sort mode only).

**Acceptance Criteria:**
- Drag handle for group rows.
- Order persists in manual mode.
- Unit test: Reorder logic.
- Integration test: Order persists after reload.

**Dependencies:** ATRIUM-0011, ATRIUM-0022

### [ATRIUM-0022] Group Sort Order Setting
**Description:**
Allow user to set group sort order (alphabetical, last used, manual).

**Acceptance Criteria:**
- Sort order selector in settings.
- List updates per selection.
- Unit test: Sort logic.
- Integration test: Sort persists after reload.

**Dependencies:** ATRIUM-0011, ATRIUM-0040

### [ATRIUM-0023] Multi-Window Support
**Description:**
Support one active group per window; show lock icon if group is active elsewhere.

**Acceptance Criteria:**
- Group cannot be active in two windows.
- Lock icon and tooltip shown.
- Unit test: Window/group state logic.
- Integration test: Switching groups in one window does not affect others.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0024] Open Group in New Window
**Description:**
Allow opening a group in a new Chrome window.

**Acceptance Criteria:**
- Open-in-new-window icon triggers new window with group tabs.
- Unit test: Window open logic.
- Integration test: Group state updates correctly.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0025] Keep/Display Groups with Zero Tabs
**Description:**
Show groups with zero tabs in the list; switching to one opens a new blank tab.

**Acceptance Criteria:**
- Empty groups remain in list.
- Switching opens new tab if group is empty.
- Unit test: Empty group logic.
- Integration test: New tab opens on switch.

**Dependencies:** ATRIUM-0011

### [ATRIUM-0026] Show Lock Icon and Disable Group if Active in Another Window
**Description:**
Disable group row and show lock icon if group is active in another window.

**Acceptance Criteria:**
- Disabled state and lock icon shown.
- Tooltip explains reason.
- Unit test: Lock logic.
- Integration test: UI updates on group state change.

**Dependencies:** ATRIUM-0023