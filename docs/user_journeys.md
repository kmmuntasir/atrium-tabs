# Atrium Tabs – User Journeys

## 1. Onboarding (First Run)
1. User installs the extension from the Chrome Web Store.
2. A "Welcome / Quick Tour" page opens automatically in a new tab.
3. The extension saves the current window as a new group named "New Group 0".
4. The user is presented with a 3-step onboarding carousel:
   - Slide 1: Shows how to capture the current window as a group.
   - Slide 2: Demonstrates switching groups with hotkeys.
   - Slide 3: Shows drag-and-drop tab management between groups.
5. The user can click Next/Back or Skip Tour at any time.
6. On finishing or skipping, the user lands on the Settings page root and sees a "Hotkeys active" toast for 2 seconds.

## 2. Daily Workflow (Power User)
1. User opens Chrome; the extension restores the last active group for each window.
2. User opens and closes tabs; the extension tracks these changes in real time.
3. User switches to another group using the popup or hotkeys; the extension saves the current group’s state, closes its tabs, and opens the new group’s tabs.
4. The last active tab in the new group is focused.
5. User uses the search box in the popup to quickly find and switch to a group.
6. User can open a group in a new window, with the extension ensuring no group is active in more than one window.

## 3. Group Management
1. User clicks the extension icon to open the popup.
2. User sees a list of groups, each with icon, name, tab count, and lock icon if active elsewhere.
3. User creates a new group by typing a name and clicking "Add"; the group appears in the list.
4. User can expand a group to see its tabs, reorder tabs, or drag tabs between groups.
5. User edits a group’s name inline or assigns a color/icon via the group icon menu.
6. User deletes a group; the row grays out and requires a second confirmation click to finalize deletion.
7. User can open a group in a new window or restore a closed group.
8. Groups with zero tabs remain in the list; switching to one opens a new blank tab.

## 4. Tab Management
1. User expands a group to view its tabs (favicon and title shown).
2. User reorders tabs within a group by dragging.
3. User drags a tab to another group (move by default, Ctrl+Drag to copy).
4. User removes a tab from a group using the close icon.
5. User right-clicks a tab in the Chrome tab bar and uses the context menu to move it to another group.

## 5. Settings & Customization
1. User opens the Settings page from the popup or via a full-page tab.
2. User toggles between light and dark themes; the extension and icon update accordingly.
3. User enables theme sync with browser/system.
4. User sets group sort order (alphabetical, last used, manual) and, if manual, reorders groups by dragging.
5. User customizes keyboard shortcuts for group switching and other actions.
6. User toggles whether pinned tabs are included in groups.
7. User enables eager-load for tabs (with warning about performance impact).
8. User sets which tab is focused on group switch (last active).

## 6. Import, Export, Backup & Restore
1. User exports all groups, tabs, and preferences as a JSON file via the Settings page.
2. User imports a JSON backup, choosing to replace or merge with current data.
3. On import, new UUIDs are generated for all imported groups/tabs; name collisions are resolved with numeric suffixes.
4. User previews recent backups in a structured, read-only view before restoring.
5. User restores from a backup (local or Google Drive, future feature).

## 7. Error Handling & Storage
1. As storage approaches 50%, 80%, or 90% capacity, the user sees a persistent toast warning.
2. At 100% capacity, the user is blocked from saving and must export or delete groups before continuing.
3. If data corruption is detected on startup, a safe-mode prompt appears, offering to export raw data, attempt auto-repair, or start fresh.

## 8. Accessibility & Localization
1. User enables high-contrast theme for better readability (light mode only).
2. User sees a shape badge next to each group icon for color-blind accessibility.
3. Extension auto-switches to the user’s browser/OS language if supported; otherwise, defaults to English.
4. User contributes translations via GitHub PRs; new translations are bundled in future updates.

## 9. Edge Cases & Special Flows
1. User opens multiple Chrome windows; each window can have its own active group, but a group cannot be active in more than one window.
2. User tries to activate a group already open in another window; the group is disabled with a lock icon and tooltip.
3. User opens the extension in Incognito mode; the extension is disabled and does not track or display any UI.
4. After an extension update, a toast appears: "Atrium updated to vX.Y"; clicking it opens the "What's New" tab.
5. User previews backups in Settings -> Backups; all groups are collapsed and read-only interactive.

---

*This list covers all major user journeys and edge cases described in the PRD. Update as features evolve.*