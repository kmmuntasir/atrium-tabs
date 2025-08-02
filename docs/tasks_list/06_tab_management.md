## Tab Management

### [ATRIUM-0027] Add Tab to Group (Real-Time Tracking)
**Description:**
Track new tabs in real time and add them to the active group.

**Acceptance Criteria:**
- New tabs are tracked and added to group.
- Unit test: Tab tracking logic.
- Integration test: Tabs update in UI as opened/closed.

**Dependencies:** ATRIUM-0009, ATRIUM-0011

### [ATRIUM-0028] Remove Tab from Group (Close Icon)
**Description:**
Allow removing a tab from a group via close icon.

**Acceptance Criteria:**
- Close icon removes tab from group.
- Unit test: Remove logic.
- Integration test: Tab removed from UI and storage.

**Dependencies:** ATRIUM-0027

### [ATRIUM-0029] Reorder Tabs Within a Group (Drag-and-Drop)
**Description:**
Enable drag-and-drop reordering of tabs within a group.

**Acceptance Criteria:**
- Drag handle for tabs.
- Order persists after reload.
- Unit test: Reorder logic.
- Integration test: Order persists in UI and storage.

**Dependencies:** ATRIUM-0027

### [ATRIUM-0030] Move Tab Between Groups (Drag-and-Drop, Ctrl+Drag to Copy)
**Description:**
Allow moving or copying tabs between groups via drag-and-drop (Ctrl+Drag to copy).

**Acceptance Criteria:**
- Tabs can be moved or copied between groups.
- Unit test: Move/copy logic.
- Integration test: Tab appears in correct group after action.

**Dependencies:** ATRIUM-0029

### [ATRIUM-0031] Open New Tab When Switching to Empty Group
**Description:**
Switching to an empty group opens a new blank tab.

**Acceptance Criteria:**
- New tab opens if group is empty.
- Unit test: Switch logic.
- Integration test: New tab appears in browser.

**Dependencies:** ATRIUM-0025

### [ATRIUM-0032] Context Menu: Move Tab to Group from Tab Bar
**Description:**
Add context menu to move a tab to a group from the Chrome tab bar.

**Status:** Skipped (Chrome API limitation)

**Note:**
Chrome Extensions cannot show a custom group selection menu or custom UI in the tab bar context menu. Only a single menu item can be added, and group selection must be handled elsewhere (e.g., via extension popup). Therefore, this feature cannot be implemented as described.

**Acceptance Criteria:**
- Context menu appears on tab right-click. *(Not possible as described)*
- Tab moves to selected group. *(Not possible as described)*
- Unit test: Context menu logic. *(N/A)*
- Integration test: Tab moves in UI and storage. *(N/A)*

**Dependencies:** ATRIUM-0030

### [ATRIUM-0033] Pinned Tabs Control (Include/Exclude in Groups)
**Description:**
Implement setting to include or exclude pinned tabs from groups.

**Acceptance Criteria:**
- Setting in UI controls pinned tab behavior.
- Unit test: Pinned tab logic.
- Integration test: Pinned tabs behave per setting.

**Dependencies:** ATRIUM-0011, ATRIUM-0040

### [ATRIUM-0034] Real-Time Tracking of Tab Open/Close/Navigation
**Description:**
Track tab open, close, and navigation events in real time.

**Acceptance Criteria:**
- All tab events are tracked and update group state.
- Unit test: Event tracking logic.
- Integration test: UI updates on tab events.

**Dependencies:** ATRIUM-0027

### [ATRIUM-0035] Focus Last Active Tab on Group Switch
**Description:**
When switching groups, focus the last active tab.

**Acceptance Criteria:**
- Last active tab is focused on switch.
- Unit test: Focus logic.
- Integration test: Tab is focused in browser.

**Dependencies:** ATRIUM-0027