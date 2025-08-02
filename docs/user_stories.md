# Atrium Tabs – User Stories

## 1. Tab Group Management
- As a user, I want to create a new tab group by naming it, so I can organize my tabs into workspaces.
- As a user, I want to save my current window as a new group, so I can quickly capture my current workflow.
- As a user, I want to switch between tab groups instantly, so I can focus on different tasks without clutter.
- As a user, I want to see a list of all my groups in a popup, so I can easily manage and switch between them.
- As a user, I want to expand a group to see its tabs, so I can review and manage the contents.
- As a user, I want to reorder tabs within a group, so I can arrange them as I prefer.
- As a user, I want to move tabs between groups via drag-and-drop, so I can reorganize my workspaces efficiently.
- As a user, I want to delete a group with a confirmation step, so I don’t accidentally lose my workspaces.
- As a user, I want to edit a group’s name, so I can keep my workspaces clearly labeled.
- As a user, I want to assign a color and icon to each group, so I can visually distinguish them.
- As a user, I want to open a group in a new window, so I can work on multiple projects simultaneously.
- As a user, I want to see which groups are active in other windows and be prevented from activating them again, so I avoid conflicts.
- As a user, I want to restore a group to a closed state when its window is closed, so I can reopen it elsewhere.
- As a user, I want to keep groups with zero tabs, so I can repopulate them later.
- As a user, I want to open a new tab when switching to an empty group, so I’m not left with a blank window.

## 2. Tab Management
- As a user, I want to remove a tab from a group, so I can keep my groups tidy.
- As a user, I want to see each tab’s favicon and title, so I can identify them easily.
- As a user, I want to reorder tabs within a group, so I can prioritize my workflow.
- As a user, I want to move tabs between groups or copy them using Ctrl+Drag, so I have flexible organization.

## 3. Settings & Customization
- As a user, I want to access a full-page settings screen, so I can customize the extension to my needs.
- As a user, I want to choose between light and dark themes, so the UI matches my preferences.
- As a user, I want the extension icon to match the selected theme, so it’s visually consistent.
- As a user, I want to sync the extension’s theme with my browser or system theme, so it adapts automatically.
- As a user, I want to set how groups are sorted (alphabetically, last used, manual), so I can find them easily.
- As a user, I want to manually reorder groups when manual sort is enabled, so I have full control over their order.
- As a user, I want to map keyboard shortcuts for actions like switching groups, so I can work faster.
- As a user, I want to toggle whether pinned tabs are included in groups, so I can control their behavior.
- As a user, I want to toggle between lazy-load and eager-load for tabs, so I can optimize performance.
- As a user, I want to set which tab is focused when switching groups (last active), so I resume where I left off.
- As a user, I want to search for groups by name in the popup, so I can quickly find the right workspace.

## 4. Import, Export, Backup & Restore
- As a user, I want to export all my groups, tabs, and preferences as a JSON file, so I can back up my data.
- As a user, I want to import groups and preferences from a JSON file, so I can restore or merge my data.
- As a user, I want to choose whether to replace or merge data during import, so I don’t lose existing work.
- As a user, I want new UUIDs generated for imported groups/tabs to avoid collisions, so my data stays consistent.
- As a user, I want to preview backups in a structured, read-only interactive view, so I can verify data before restoring.
- As a user, I want to restore from Google Drive backups (future), so I have cloud-based safety.
- As a user, I want to see a list of recent backups and preview or restore them, so I can recover from mistakes.

## 5. Multi-Window & Context Menu
- As a user, I want each Chrome window to have its own active group, so I can multitask across projects.
- As a user, I want to be prevented from activating the same group in multiple windows, so my workspaces stay isolated.
- As a user, I want to move a tab to another group via the tab bar context menu, so I can organize tabs quickly.
- As a user, I want the extension to do nothing in Incognito mode, so my private browsing is not affected.

## 6. Accessibility & Onboarding
- As a user, I want a high-contrast theme option (light mode), so the UI is readable for me.
- As a user, I want a color-blind-friendly shape badge next to each group icon, so I can distinguish groups without relying on color.
- As a user, I want a 3-step onboarding carousel with screenshots/GIFs, so I can learn the extension quickly.
- As a user, I want to skip or finish onboarding and see a “Hotkeys active” toast, so I know when setup is complete.

## 7. Error Handling & Storage
- As a user, I want to be warned as storage approaches quota, so I can export or delete groups before running out of space.
- As a user, I want to be blocked from saving when storage is full, so I don’t lose data.
- As a user, I want a safe-mode prompt if data is corrupt, so I can export, auto-repair, or start fresh.

## 8. Telemetry & Privacy
- As a user, I want telemetry to be opt-in, so my data is private by default.
- As a user, I want to see exactly what data is sent (no URLs, hostnames, or user-supplied strings), so I can trust the extension.
- As a user, I want to limit telemetry to crash dumps, error logs, and daily heartbeat, so my privacy is respected.
- As a user, I want to generate a random UUID for telemetry, so my identity is protected.

## 9. Localization
- As a user, I want the extension to auto-switch to my browser/OS language if supported, so I can use it in my preferred language.
- As a user, I want to contribute translations via GitHub PRs, so the extension can support more languages.

---

*This list is derived from the MVP PRD and covers all major user-facing flows and requirements. Update as features evolve.*