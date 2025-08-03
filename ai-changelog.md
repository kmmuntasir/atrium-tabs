# AI Changelog

### 2025-08-03 13:53:40
- Updated documentation

### 2024-07-28 17:00:00
- ATRIUM-0001: Project Repository Initialization - Created src, public, and test directories, updated task sequence.

### 2024-07-28 17:00:00
- ATRIUM-0002: Tooling & Linting Setup - Configured ESLint, Prettier, TypeScript, and Husky.

### 2024-07-28 17:00:00
- ATRIUM-0003: Vite & React Project Bootstrap - Bootstrapped Vite and React project with TypeScript, installed Radix UI, and resolved build issues.

### 2024-07-28 17:00:00
- Skipped Deployment & CI/CD tasks (ATRIUM-0004, ATRIUM-0005, ATRIUM-0006, ATRIUM-0007) as requested. Verified no blocking dependencies for future tasks.

### 2024-07-30 15:30:00
- Started ATRIUM-0008: Implemented Group data model and CRUD operations. (In Progress)

### 2024-07-30 15:35:00
- Completed ATRIUM-0008: Implemented Group data model, CRUD operations, and all associated unit and integration tests.

### 2024-07-30 15:40:00
- Created new rule: edit-file-guidelines.mdc.

### 2024-08-03 14:08:58
- Implemented ATRIUM-0009: Tab Data Model Implementation.
  - Created `src/types/Tab.ts` for the Tab interface.
  - Created `src/storage/TabStorage.ts` for CRUD operations on tabs.
  - Added unit tests in `test/unit/Tab.test.ts`.
  - Added integration tests in `test/integration/TabPersistence.test.ts`.
  - Added 'test' script to `package.json`.

### 2024-08-03 14:09:00
- Created new rule: `.cursor/rules/run-terminal-cmd-guidelines.mdc`.

### 2024-07-30 10:30:00
- Modified `npm test` script to exit automatically after tests complete.
- Fixed build errors by:
  - Updating type imports to 'import type' for Group and Tab models.
  - Installing @types/chrome to resolve 'chrome' object errors.
  - Correctly integrating Vitest with Vite in vite.config.ts by merging configurations.

### 2024-08-03 14:21:00
- Implemented ATRIUM-0010: Basic Popup UI Scaffold.
  - Modified `src/App.tsx` for the basic UI layout.
  - Installed `@radix-ui/react-icons`, `@testing-library/react`, and `@testing-library/jest-dom`.
  - Created unit test `test/unit/App.test.tsx`.
  - Configured Vitest to use `jest-dom` matchers via `test/setupTests.ts` and `vite.config.ts`.
  - Added build script to `package.json` and built the project.
  - Created placeholder integration test `test/integration/PopupLoading.test.ts`.
  - Created `public/manifest.json` for extension configuration and updated `package.json` and `index.html` to support extension loading.

### 2024-07-30 14:30:40 - Task Completed
**Task:** ATRIUM-0011: Group List in Popup
**Description:** Implemented the GroupList component to display a list of user groups in the main popup UI. This includes fetching groups from storage, rendering them, and adding basic styling.
**Files Modified:**
- src/App.tsx
- src/components/GroupList.tsx
- src/App.css
- test/unit/GroupList.test.tsx
- test/unit/App.test.tsx
- vite.config.ts
- src/storage/GroupStorage.ts
**Reason for update:** Ensured successful build by exporting `getGroups` from `src/storage/GroupStorage.ts`.

### 2025-08-03 14:44:31
- Started ATRIUM-0012: Implemented expand/collapse group to show tabs.

### 2025-08-03 14:45:44
- Completed ATRIUM-0012: Implemented expand/collapse group to show tabs.

### 2024-08-03 15:00:00
- Implemented ATRIUM-0014: UI Polish: Color Palette, Icon Rendering, Toast Positioning.
  - Defined CSS variables for color palette in `src/index.css`.
  - Applied CSS variables and moved `body` styling to `src/App.css`.
  - Updated `src/components/GroupList.tsx` to display group icons and colors.
  - Installed `@radix-ui/react-toast`.
  - Integrated Radix UI Toast into `src/App.tsx` with a trigger button.
  - Added CSS for Toast component positioning in `src/App.css`.

### 2024-07-30 10:00:00
- Implemented ATRIUM-0015: Added functionality to create new groups with manual name input in `src/components/GroupList.tsx` and integrated `uuid` for unique ID generation. Updated `GroupStorage.ts` for group persistence.

### 2024-07-30 10:05:00
- Implemented ATRIUM-0016: Added functionality to save the current window's tabs as a new group in `src/components/GroupList.tsx`. Utilized `chrome.tabs` API and integrated with `TabStorage.ts` to persist tabs.

### 2024-07-30 10:08:00
- Fixed build error in `src/storage/TabStorage.ts` by removing duplicate `saveTabs` method and refactoring other methods to use `getAllTabs` and `saveAllTabs`. Also changed `id` to `uuid` in `src/types/Tab.ts` to align with `uuid` usage.

### 2024-07-30 10:10:00
- Implemented ATRIUM-0017: Added inline editing for group names in `src/components/GroupList.tsx`, using `updateGroup` from `GroupStorage.ts` for persistence.

### 2024-07-30 10:00:00 - Task Completed
**Task:** [ATRIUM-0018]: Assign Color and Icon to Group (Selector UI)
**Description:** Implemented functionality to assign a color and an icon to a group using selector UIs. This involved updating the Group interface, adding state management for color and icon selection in GroupList.tsx, and integrating color and icon input fields for both new group creation and existing group editing. The selected color and icon are now persisted with group data.
**Files Modified:**
- src/types/Group.ts
- src/components/GroupList.tsx
**Reason for update:** Completed task ATRIUM-0018.

### 2024-07-30 10:05:00 - Task Completed
**Task:** [ATRIUM-0019]: Delete Group (Soft Delete, Confirmation)
**Description:** Implemented soft delete functionality for groups. This involved adding `isDeleted` and `deletedAt` properties to the `Group` interface, modifying `getGroups` and `deleteGroup` in `GroupStorage.ts` to handle soft deletions, and adding a delete button with a confirmation dialog to `GroupList.tsx`.
**Files Modified:**
- src/types/Group.ts
- src/storage/GroupStorage.ts
- src/components/GroupList.tsx
**Reason for update:** Completed task ATRIUM-0019.

### 2024-08-03 16:03:00 - Task Completed
**Task:** [ATRIUM-0020]: Restore Closed Group
**Description:** Implemented the ability to restore soft-deleted groups. This involved adding a `restoreGroup` function to `src/storage/GroupStorage.ts`, updating `src/components/GroupList.tsx` to display a restore button for deleted groups and apply a 'deleted' CSS class, and adding unit tests for the restore logic.
**Files Modified:**
- src/storage/GroupStorage.ts
- src/components/GroupList.tsx
- src/App.css
- test/unit/Group.test.ts
**Reason for update:** Completed task ATRIUM-0020, and removed integration tests as requested.

### 2024-08-03 16:50:00 - Task Completed
**Task:** [ATRIUM-0023]: Multi-Window Support
**Description:** Implemented multi-window support by tracking active groups per window. This involved adding functions to `src/storage/GroupStorage.ts` to manage active groups by window ID, and updating `src/components/GroupList.tsx` to display a lock icon and disable activation for groups already active in other windows. The UI now prevents a group from being active in two windows simultaneously, and allows switching active groups within a window, closing previous tabs and opening new ones.
**Files Modified:**
- src/storage/GroupStorage.ts
- src/components/GroupList.tsx
- docs/task_sequence.md
**Reason for update:** Completed task ATRIUM-0023.

### 2024-08-03 16:55:00 - Task Completed
**Task:** [ATRIUM-0024]: Open Group in New Window
**Description:** Implemented the functionality to open a group in a new Chrome window. This involved adding a new button to `src/components/GroupList.tsx` that, when clicked, creates a new window and opens all tabs associated with the selected group within that new window. The active group state for the new window is also updated in `src/storage/GroupStorage.ts`.
**Files Modified:**
- src/components/GroupList.tsx
- docs/task_sequence.md
**Reason for update:** Completed task ATRIUM-0024.
