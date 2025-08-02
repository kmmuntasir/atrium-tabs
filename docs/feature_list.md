# Atrium Tabs – Feature List

## Data Model
1. Group data model (UUID, name, timestamps, color, icon)
2. Tab data model (URL, title, pinned, groupId, favicon, createdAt)

## UI
3. Basic popup UI scaffold (React, Vite, Radix UI, Initial Layout)
4. List all groups in popup (with icon, name, tab count, lock icon if active elsewhere)
5. Expand/collapse group to show tabs (favicon, title)
6. Read-only backup preview mimicking popup UI
7. UI polish: color palette adherence, icon rendering, toast positioning, and Radix UI component styling

## Group Management
8. Create new group (manual name input)
9. Save current window as new group (auto-naming, color assignment)
10. Edit group name (inline editing)
11. Assign color and icon to group (selector UI)
12. Delete group (soft delete, confirmation)
13. Restore closed group
14. Manual group reordering (drag-and-drop, only in manual sort mode)
15. Group sort order setting (alphabetical, last used, manual)
16. Multi-window support (one active group per window, lock icon if active elsewhere)
17. Open group in new window
18. Keep/display groups with zero tabs
19. Show lock icon and disable group if active in another window

## Tab Management
20. Add tab to group (real-time tracking of new tabs)
21. Remove tab from group (close icon)
22. Reorder tabs within a group (drag-and-drop)
23. Move tab between groups (drag-and-drop, move by default; Ctrl+Drag to copy)
24. Open new tab when switching to empty group
25. Context menu: move tab to group from tab bar
26. Pinned tabs control (setting: include/exclude in groups)
27. Real-time tracking of tab open/close/navigation
28. Focus last active tab on group switch

## Settings & Customization
29. Full-page settings screen (accessible from popup)
30. Theme toggle (light/dark, sync with browser/system)
31. Extension icon updates with theme
32. Keyboard shortcut mapping UI
33. Default hotkeys for group switching (Ctrl/Cmd+Shift+1-9)
34. Toggle lazy-load/eager-load for tabs (with warning)
35. ARIA labels and keyboard navigation for accessibility, leveraging Radix UI's built-in accessibility features

## Import/Export & Backup
36. Export groups, tabs, and preferences as JSON
37. Import JSON backup (replace or merge, handle UUIDs and name collisions)
38. Preview backups (structured, read-only view mimicking popup UI)
39. List and restore recent backups
40. Community translation pipeline (GitHub PRs, review, bundling)
41. Localization: auto-switch to browser/OS language, static JSON files in /locales

## Error Handling & Storage
42. Storage quota warnings (persistent toast at 50%, 80%, 90%)
43. Block save and show modal at 100% storage
44. Safe-mode prompt and auto-repair for data corruption

## Telemetry & Metrics
45. Telemetry opt-in (crash/error/heartbeat, no URLs/hostnames)
46. Generate/store random UUID for telemetry
47. Define and document key metrics (daily active users, average groups/tabs per user)

## Accessibility & Onboarding
48. High-contrast theme (light mode)
49. Color-blind shape badge next to group icon
50. Automated accessibility and UI tests
51. 3-step onboarding carousel with screenshots/GIFs, built with Radix UI components
52. Show “Hotkeys active” toast after onboarding

## Non-Functional
53. Performance optimization for large groups/tabs
54. Security review and permissions minimization

<!-- Tech Stack Reference: See PRD section 7.1. Component Library: Radix UI primitives required. -->