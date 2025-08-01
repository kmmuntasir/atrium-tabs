# Atrium Tabs - Product Requirements Document (MVP)

## 1. Project Overview

### 1.1 Idea
Atrium Tabs is a minimalist Chrome extension that brings back real-time tab group switching, allowing users to isolate, manage, and switch between tab workspaces effortlessly, without the clutter of session history or bloated UI. It is inspired by the now-abandoned 'Sync Tab Groups' extension.

### 1.2 Target Audience
Primary focus is on power users (developers, researchers, heavy tab hoarders), with occasional regular users also able to utilize it for a cleaner workspace.

### 1.3 Key Differentiators
- Real-Time Group Tracking: New tabs opened or closed are automatically tracked.
- Instant Group Switching: Current group tabs close, new group tabs open instantly.
- Minimal UI: Lightweight popup and clean UX, no dashboards or sync prompts.

## 2. Core Requirements

### 2.1 Pinned Tabs Control
- Users can choose whether pinned tabs belong to groups or persist across all. This is controlled via a checkbox in settings. If "Include Pinned Tabs in Groups" is OFF, pinned tabs are truly global across all windows, stay put when switching groups in a window, and are ignored by the extension (not stored or processed). If ON, pinned tabs are part of the group and remain pinned when the group is restored.
- The first opened window will show the pinned tabs. If a group is opened in a new window, that new window will not show the pinned tabs.

### 2.2 Persistent Groups
All tab groups are stored locally and restored on browser restart.

### 2.3 Multi-Window Handling
Each Chrome window can host its own active group. Switching groups in one window does not affect other windows. A group cannot be active in two windows simultaneously. If a user tries to activate a group already open in another window, the UI will disable the item with a gray lock icon and a tooltip (e.g., "Already active in Window 1").

### 2.4 Data Storage Strategy
For MVP, `chrome.storage.local` / `browser.storage.local` will be used to store all data (groups + tabs + preferences). This is simpler to implement and port, accepting the 5 MB ceiling. Future versions may consider a hybrid approach with IndexedDB for bulky data like thumbnails.

### 2.5 Incognito Mode
The extension will be disabled in Incognito mode; no UI or tracking will occur.

### 2.6 Browser Compatibility
- Chrome desktop: Minimum version 112 (April 2023).
- Firefox desktop: Minimum version 115 ESR (July 2023).
- The extension will ship as a Manifest V3 build only.

### 2.7 Accessibility
- High-contrast theme: Keep existing palettes but bump contrast (e.g., darker text, lighter row backgrounds, thicker borders). This applies only to light mode.
- Color-blind considerations: A tiny shape badge next to the group's main icon will cycle through 6 shapes (●, ■, ▲, ◆, ★, ⬟) to provide a non-color cue.

## 3. Core Features

### 3.1 Group Management
#### 3.1.1 Popup UI
- **Visible Info (left to right):** Icon, Name, Tab Count Badge, Lock Icon (if active elsewhere). The row's background color will be the group's color.
- **Primary Click:** Switch to the group.
- **Inline Actions (right-slanted, left to right):**
    - **Close icon:** Closes the group window if it's not the current window.
    - **Delete icon:** One-click delete. The row grays out, the delete icon turns into a restore icon, and the edit icon is hidden. Another delete icon appears where the edit icon was. A second click confirms final deletion.
    - **Edit icon:** Turns the group name into an inline editable text field. User edits and hits Enter to update.
    - **Up/Down arrow icon:** Expands/collapses the group. Multiple groups can be expanded simultaneously.
    - **Open in new tab icon:** (If the group is currently closed). Opens the group in a brand-new Chrome window while the current window remains unchanged. Chrome/OS decides window positioning. When the new window closes, the group returns to a "closed" state.
- **Secondary Actions (via clickable group icon):** Opens a small popup with two tabs: Icon selector (Lucide Icon preferred) and Color selector (from a palette).

#### 3.1.2 Expanded Group Row (in Popup)
- **Per-tab display (left to right):** Favicon, Title text.
- **Per-tab actions (right-slanted, left to right):**
    - **Drag icon:** Reorder tab within the group or move between groups (move operation by default, Ctrl+Drag to copy).
    - **Close icon:** Remove tab from the group.
- Clicking a tab title does nothing.

#### 3.1.3 Group Management Page (Full-Page)
- Opens in a new tab.
- Provides the same functionality as the popup (add, delete, edit group title).
- **Layout:** Single scrolling list of collapsible group rows (similar to popup, but wider). Tabs land at the end when dragged.
- **Side-by-side View:** An icon toggles a two-column layout. Both columns show the same full, independently scrollable list of groups with independent expand/collapse. Defaults to single-column mode on open.
- **Drag and Drop:** Move operation (default), Ctrl+Drag for copy. No multi-select.

### 3.2 Group Creation
- Users pin the extension. Clicking the icon opens a popup showing the group list. A text input field at the bottom allows adding a new group by typing a name and hitting Enter/clicking "Add". The group is added to the list but not switched to. Switching occurs only by clicking the group name.
- "Save current window as new group" feature: Pops a naming dialog pre-filled with "Window - Jul 30 @ 14:37". Obeys "Include Pinned Tabs in Groups" setting. Auto-assigns a unique color from the palette.
- Groups with 0 tabs are kept in the list. When a group with 0 tabs is switched to, a new tab is opened in the browser for that group.

### 3.3 Keyboard Shortcuts
- Customizable via a custom settings UI.
- Default "jump straight to group 1-9" shortcuts:
    - Windows / Linux: `Ctrl+Shift+1` through `Ctrl+Shift+9`
    - macOS: `⌘+Shift+1` through `⌘+Shift+9`
- "Save current window as new group" ships unset by default.

### 3.4 Import/Export
- **Export:**
    - **Content:** Includes all groups, tabs (nested within group objects), and global preferences (theme, hotkeys, "include pinned tabs," sort order).
    - **Compatibility:** Defines a new, simpler schema.
    - **Delivery:** Downloads a plain-text `.atrium-tabs-backup.json` file. Opens a file explorer/manager window for user to choose save location.
- **Import:**
    - User is given a choice: "Delete all current group data and Import the new data" (current data restores on failure) or "Add the data from the import to the current data".
    - New UUIDs are generated for all imported groups and tabs to prevent collisions.
    - If group names collide, an incremental numeric suffix is added.
- **Preview Backup:** A dated list of the last 25 files is shown in Settings -> Backups, with "Preview JSON / Restore" buttons. Preview mimics the popup's look and feel, read-only interactive, with all groups collapsed by default. It shows a structured summary by default, with a toggle for raw code view. Confirmation prompt ("This will overwrite your current groups - proceed?") and automatic local export offered before restoring.

### 3.5 Telemetry & Analytics (Opt-in)
- Strictly opt-in (disabled by default).
- **Data Sent:**
    - Crash reports: stack trace, extension version, browser version, OS (no URLs/hostnames, no user identifiers).
    - Error logs: non-fatal exceptions with environment metadata (no URLs/hostnames, no user identifiers).
    - Heartbeat: once daily counts of total groups and total tabs (no URLs/hostnames, no user identifiers). This will also carry group_count and tab_count.
- **Service:** Google Analytics 4's Measurement Protocol (free).
- **User Identifier:** A random UUID is generated once per install and stored locally (`user_pseudo_id`).
- **Rate Limit:** Max 3 hits per user per day.
- **Heartbeat Trigger:** First time the extension's background wakes up each calendar day.
- **Legal Review:** Regular standard for projects like this.

### 3.6 Update Communication
- A popup toast will show "Atrium updated to vX.Y" (no bullet points).
- Clicking the toast opens a full "What's New" tab.
- The toast auto-fades after 3 seconds and never reappears for that version.
- Toast position and styling will be well-designed.

### 3.7 Google Drive Backup (Future Release)
- **Trigger:** Both manual "Back up now" button and scheduled automatic backups.
- **Auth Flow:** One-time OAuth with a revocable token stored locally.
- **Scope:** Just the JSON file, no thumbnails.
- **Frequency:** Every hour, keeping 25 historical backups.
- **Naming:** Single "Atrium Tabs Backups" folder at Drive root. Filename: `atrium-YYYY-MM-DD-HH-mm-ss-v{extVersion}[-manual].json`. Manual jobs always get "-manual" suffix.

### 3.8 Context Menu Integration
- Right-clicking a tab on the tab bar will show a "Move tab to -> [Group list]" option. When selected, the tab will instantly move to the target group (closes from current window, is now only in target group).
- The "Save current window as new group" feature does not require a context menu; it is available via a button in the popup.

## 4. Core Components

### 4.1 UI Views
- **Popup:** Lightweight, accessible via toolbar icon.
- **Settings Page:** Full-page, opened in a new tab.
- **Group Management Page:** Full-page, opened in a new tab.
- **Welcome/Quick Tour Page:** A tab within the settings page, shown on first run.
- **What's New Tab:** Opened after an update when clicking the toast.

### 4.2 Group/Tab Data Model (MVP Fields)
#### Group-level (MVP)
- `id` (UUID)
- `name` (string)
- `createdAt`, `updatedAt` (ISO timestamps)
- `lastActiveAt` (for "sort by last usage")
- `order` (manual sort index)

#### Group-level (Nice-to-have for MVP, optional for first release)
- `color` (hex)
- `icon` (Lucide / FontAwesome string)

#### Tab-level (MVP)
- `url`
- `title`
- `pinned` (bool)
- `groupId` (FK)
- `faviconUrl`
- `createdAt`

#### Tab-level (Nice-to-have for MVP, optional for first release)
- `thumbnail` (if API allows)
- `scrollPosition`

### 4.3 Extension Icons
- **Light mode icon:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- uniform 8‑pixel gaps everywhere -->
  <rect x="16"  y="12" width="64" height="44" rx="5" ry="5" fill="#404040"/>
  <rect x="88"  y="12" width="32" height="44" rx="5" ry="5" fill="#404040"/>
  <rect x="16"  y="64" width="32" height="48" rx="5" ry="5" fill="#404040"/>
  <rect x="56"  y="64" width="64" height="48" rx="5" ry="5" fill="#404040"/>
  
</svg>
```
- **Dark mode icon:** Inverted version of the light mode icon (light tones).
- Rendered to 16x16, 32x32, 48x48, 128x128 PNG sizes with transparent backgrounds.
- No toolbar badge required.

#### 4.4 Color Palettes
- Two 4x4 grids of 16 colors each:

### 🎨 Light-theme palette (Pastels – Dark Text)

|     | 1               | 2               | 3               | 4               |
|-----|------------------|------------------|------------------|------------------|
| A   | `#EF9A9A` (Red 200)       | `#F48FB1` (Pink 200)     | `#CE93D8` (Purple 200)  | `#B39DDB` (Deep Purple 200) |
| B   | `#9FA8DA` (Indigo 200)    | `#90CAF9` (Blue 200)     | `#81D4FA` (Light Blue 200) | `#80DEEA` (Cyan 200)         |
| C   | `#80CBC4` (Teal 200)      | `#A5D6A7` (Green 200)    | `#C5E1A5` (Light Green 200) | `#E6EE9C` (Lime 200)        |
| D   | `#FFF59D` (Yellow 200)    | `#FFE082` (Amber 200)    | `#FFCC80` (Orange 200)     | `#FFAB91` (Deep Orange 200) |

---

### 🌙 Dark-theme palette (Deep Hues – Light Text)

|     | 1               | 2               | 3               | 4               |
|-----|------------------|------------------|------------------|------------------|
| A   | `#D32F2F` (Red 700)       | `#C2185B` (Pink 700)     | `#7B1FA2` (Purple 700)  | `#512DA8` (Deep Purple 700) |
| B   | `#303F9F` (Indigo 700)    | `#1976D2` (Blue 700)     | `#0288D1` (Light Blue 700) | `#0097A7` (Cyan 700)         |
| C   | `#00796B` (Teal 700)      | `#388E3C` (Green 700)    | `#689F38` (Light Green 700) | `#AFB42B` (Lime 700)        |
| D   | `#FBC02D` (Yellow 700)    | `#FFA000` (Amber 700)    | `#F57C00` (Orange 700)     | `#E64A19` (Deep Orange 700) |


## 5. UI Description

### 5.1 Popup UI
- **General:** Lightweight popup that appears when the user clicks the toolbar icon. Contains a list of groups.
- **Group List:**
    - **Visible Info (left to right):** Icon, Group Name, Tab Count Badge, Lock Icon (if the group is active elsewhere).
    - **Row Styling:** The row's background color will be the group's color.
    - **Primary Click:** Clicking a group row will switch to that group.
    - **Inline Actions (slanted to the right side, left to right sequence):**
        - **Close icon:** Closes the group window if it's not the currently active window.
        - **Delete icon:**
            1.  **First Click:** The row grays out, the delete icon turns into a restore icon, and the edit icon is hidden. A second delete icon appears where the edit icon was. This is a soft delete.
            2.  **Second Click:** User must move the mouse cursor to the right and click the second delete icon to finally delete the group. This prevents accidental double-clicks.
        - **Edit icon:** When clicked, the group name in the row turns into an inline editable text field. The user can edit the name and hit Enter to update it.
        - **Up/Down arrow icon:** Expands/collapses the group to show its tabs. Multiple groups can be kept expanded simultaneously (not an accordion).
        - **Open in new tab icon:** (Visible only if the group is currently closed). Opens the group in a brand-new Chrome window while the current window remains unchanged. Chrome/Operating System decides window positioning. When the new window closes, the group returns to the "closed" state.
    - **Secondary Actions (via clickable group icon):** Clicking the icon before the group name opens a small popup window with two tabs:
        -   **Icon Selector:** Allows choosing a Lucide Icon (preferred) for the group.
        -   **Color Selector:** Allows choosing a color from a predefined palette.
- **Search Box:** A compact search box at the top of the popup to type-to-filter the group list. It should match names only and clear the filter when the popup closes.

### 5.2 Expanded Group Row (within Popup)
- **Per-tab display (left to right):** Favicon, Title text.
- **Per-tab actions (slanted to the right, left to right sequence):**
    - **Drag icon:** To reorder the tab within the group or to move it between groups. Default is a move operation; Ctrl+Drag will perform a copy operation.
    - **Close icon:** To remove the tab from the group (instant move, the tab closes right away and is now only in the target group).
- Clicking a tab title does nothing.

### 5.3 Settings Page (Full-Page)
- Opens in a new tab.
- **Sections/Toggles:**
    - **Sort:** Options for sorting groups (Alphabetically ascending/descending, Last Usage, Manual).
    - **Theme:** Light and Dark modes. Should also control the pinned extension icon. Includes an option to sync with the browser/system theme.
    - **Import/Export:** Allows importing or exporting group collections as JSON files.
    - **Hotkey Mapping:** Custom UI for mapping keyboard shortcuts.
    - **"Include Pinned Tabs in Groups" checkbox:** Controls pinned tab behavior (as described in Core Requirements).
    - **Eager Load Toggle:** Allows power users to switch between Lazy-load (default) and Eager-load. When Eager-load is enabled, an inline warning will be displayed about performance impact ("Heads-up: eager loading can hammer RAM/CPU on large groups."). Default is OFF.
    - **Welcome/Quick Tour Tab:** Onboarding carousel accessible as a tab within the settings page.

### 5.4 Group Management Page (Full-Page)
- Opens in a new tab.
- **Functionality:** Has the same core functionalities as the popup (add new group, delete group with confirmation, edit group title).
- **Layout:**
    - **Default:** Single scrolling list where groups are collapsible rows (similar to the popup, just wider). Tabs land at the end when dragged.
    - **Side-by-side View:** An icon toggles a two-column layout. Both columns immediately show the same full list of groups, independently scrollable, with independent expand/collapse. The same "side-by-side" icon acts as a toggle to switch back to single-column mode. It will always default to single-column mode when opened.
- **Drag and Drop:** Move operation by default; Ctrl+Drag to copy. No multi-select for drag and drop.

### 5.5 Welcome/Quick Tour Page
- Accessible as a tab within the Settings page.
- **Format:** A bite-sized 3-step carousel with screenshots/GIFs.
- **Content:**
    - **Slide 1: "Capture This Chaos"**
        - **Caption:** "Click the Atrium icon once-bam! Your mess becomes 'New Group 0'."
        - **Shows:** Cursor hitting toolbar icon -> popup flashes, "+ Save window" clicked -> popup shows newly added "New Group 0" row.
        - **CTAs:** Next, Skip Tour.
    - **Slide 2: "Jump Like a Jedi"**
        - **Caption:** "Smash Ctrl/⌘‑Shift‑1.9 to swap groups; your old tabs vanish, the new set pops in."
        - **Shows:** Animated key-combo overlay -> instant tab-swap in the same window; badge shows tab count updating.
        - **CTAs:** Back, Next, Skip Tour.
    - **Slide 3: "Drag, Drop, Dominate"**
        - **Caption:** "Open Group Management to shuffle tabs between groups-goodbye clutter."
        - **Shows:** Management page in side-by-side mode; user drags a tab from left column's Dev group into right column's Research group, row count updates.
        - **CTAs:** Back, Finish.
- **Navigation:**
    - "Skip Tour" closes the carousel and lands on the Settings page root.
    - "Finish" closes the carousel, lands on the Settings page root, and flashes a "Hotkeys active" toast for 2 seconds.

### 5.6 Update Toast
- **Trigger:** Displays after an extension update (e.g., v1.1 -> v1.2).
- **Content:** Shows only the title, e.g., "Atrium updated to vX.Y" (no bullet points).
- **Click Action:** Clicking the toast opens a full "What's New" tab.
- **Lifecycle:** Auto-fades after 3 seconds and never reappears for that specific version.
- **Positioning & Styling:** Will be well-designed for good aesthetics and user experience.

### 5.7 Backup Preview (within Settings -> Backups)
- Mimics the normal popup's look and feel, embedded in the Settings -> Backups pane.
- All groups are initially collapsed.
- **Interactivity:** Read-only interactive. Users may expand groups and scroll inside them but cannot switch to a group, rename, drag, or delete.
- **View Options:** Shows a structured summary by default, with a toggle for raw code view.

### 5.8 Color-blind Accessibility
- **Cue:** A tiny shape badge (e.g., ●, ■, ▲, ◆, ★, ⬟) will be added next to the group's main icon, cycling through the 6 shapes to provide a non-color cue. This adds a single `<span>` with an `aria-label` ("shape marker").

## 6. User Journeys

### 6.1 Onboarding (First Run)
1. User installs the extension.
2. Auto-opens a "Welcome / Quick Tour" page (tab in settings).
3. The current window is automatically saved as a new group named "New Group 0".
4. Users can explore other settings tabs.
5. The Welcome/Quick Tour page is a 3-step carousel with screenshots/GIFs:
    - **Slide 1: "Capture This Chaos"**
        - **Caption:** "Click the Atrium icon once-bam! Your mess becomes 'New Group 0'."
        - **Shows:** Cursor hitting toolbar icon -> popup flashes, "+ Save window" clicked -> popup shows newly added "New Group 0" row.
        - **CTAs:** Next, Skip Tour.
    - **Slide 2: "Jump Like a Jedi"**
        - **Caption:** "Smash Ctrl/⌘‑Shift‑1.9 to swap groups; your old tabs vanish, the new set pops in."
        - **Shows:** Animated key-combo overlay -> instant tab-swap in same window; badge shows tab count updating.
        - **CTAs:** Back, Next, Skip Tour.
    - **Slide 3: "Drag, Drop, Dominate"**
        - **Caption:** "Open Group Management to shuffle tabs between groups-goodbye clutter."
        - **Shows:** Management page in side-by-side mode; user drags a tab from left column's Dev group into right column's Research group, row count updates.
        - **CTAs:** Back, Finish.
    - "Skip Tour" closes the carousel and lands on the Settings page root. "Finish" does the same but also flashes a "Hotkeys active" toast for 2 seconds.

### 6.2 Daily Workflow (Power User)
1. User opens the browser, which restores to the group they were on when they last closed the browser.
2. User opens/closes tabs, which are synced with the extension's internal memory in real-time.
3. User switches to another group (e.g., via hotkey or popup), which restores that group's tabs and closes the previously active group's tabs.
4. User can quickly find groups using the compact search box at the top of the popup (matches name only, clears on popup close).

### 6.3 Tab Loading Strategy
- Default: Lazy-load (tabs created in a discarded state, loaded on focus).
- Toggle in Settings: Power users can enable Eager-load. A warning will be shown about performance impact ("Heads-up: eager loading can hammer RAM/CPU on large groups."). Default is OFF.
- Focus Tab: When switching to a group, the last active tab of that group will grab focus and be eagerly loaded.

### 6.4 Storage Quota & Corruption Handling
- **Quota:**
    - Warn at 50%, 80%, and 90% capacity (persistent toast, user must click to close).
    - Force user action at 100% capacity (block save, modal: "Storage full. Export or delete some groups before continuing."). 
- **Corruption:**
    - On startup, a "Safe-mode prompt" modal appears: "Your saved groups appear corrupted. Export raw data, attempt auto-repair, or start fresh?"
    - User can choose to attempt auto-recovery.

### 6.5 Localization
- Supports English (primary), French, German, Italian, Russian, Spanish initially.
- Auto-switches to browser/OS locale if available, otherwise defaults to English.
- Translations stored in static JSON files in `/locales`.
- New translations bundled only on extension updates.
- Contribution pipeline: Public GitHub repo, plain PRs from open-source contributors, review and approval by the project owner (kmmuntasir@gmail.com).

### 6.6 Sorting
- **Default Sort:** Alphabetical.
- **Available Sort Modes:** Alphabetical (ascending/descending), Last Usage, Manual.
- **Drag and Drop:** Only supported when "Manual" sort is selected in settings.
- **Scope:** Chosen sort order applies to both the popup and Group Management page.
- **Persistence:** Sort setting lives in `storage.local` and syncs across machines via JSON export.

### 6.7 Metrics Definitions
- **Daily Active Users:** A user is "active" if they simply have Chrome open with the extension installed.
- **Average Groups per User:** Includes empty groups in the count.
- **Average Tabs per Group per User:** Counts all tabs (discarded + pinned per current settings).

## 7. Tech Stack

### 7.1 Frontend
- **UI Framework:** React
- **Language:** TypeScript
- **Styling:** Plain CSS/SCSS files (No Tailwind)
- **Component Library:** Radix UI primitives
- **Bundler:** Vite

### 7.2 Development & CI/CD
- **Version Control:** Git (public GitHub repo)
- **Branch Strategy:** `main` + `develop`
- **CI Checks (must-have):**
    - **Lint:** ESLint with `@typescript-eslint` plugin, `eslint-config-airbnb-typescript` as base, `eslint-plugin-react` & `eslint-plugin-react-hooks`, Prettier hooked in via `eslint-config-prettier`.
    - **Unit Tests:** Vitest + `@testing-library/react`. Minimum coverage: >= 80%.
- **Release Automation:** Semantic Release integrated into CI to parse conventional commit messages, auto-bump SemVer, generate & push `CHANGELOG.md`, and kick off build.
- **Chrome Web Store Publishing:** GitHub Actions upload build as a draft; manual trigger for public publishing. Credentials (extension ID, client ID, client secret, refresh token) stored as GitHub Secrets.

## 8. Implementation Plan

### 8.1 Web Store Listing (MVP)
- **Name:** "Atrium Tabs" (max 30 chars)
- **Tagline:** "Real-time tab workspaces, simplified." (max 45 chars)
- **Short Description:** "Instantly switch, isolate, and manage tab workspaces without clutter. Minimal UI, power-user hotkeys, fully local." (<= 132 chars)
- **Long Description:** Atrium Tabs resurrects the beloved real-time tab-group workflow of "Sync Tab Groups"---but faster, cleaner, and Manifest V3-ready. <br><br>- One-click group capture -- Snap your current window into a workspace in seconds. <br>- Instant switching -- Close the noise, open the focus; your last active tab is ready. <br>- Hotkey-loving -- Jump to groups 1-9 with Ctrl/⌘ + Shift + ⟶ numbers (remappable). <br>- Pinned-tab control -- Keep pins global or per-group; you decide. \n- Minimal UI -- No dashboards, no cloud nags---just a lightweight popup and a power-user management page. <br>- 100 % local -- Data stays in `chrome.storage.local`; backup/export is one click. <br><br>Open-source (GPL-3) and built for Chrome 112+ / Firefox 115 ESR+. Join the project on GitHub and shape the roadmap.
- **Screenshots (1280x800 recommended):**
    1. **Popup View:** All groups collapsed, color grid visible, search bar at top. Caption overlay: "Switch workspaces instantly."
    2. **Group Management -- Side-by-Side:** Showing two columns, drag-and-drop of a tab between groups. Caption: "Drag tabs across groups."
    3. **Settings Page:** With Hotkey mapper, Theme palette (light/dark), and Import/Export panel. Caption: "Power-user settings, zero bloat."

### 8.2 Community Health Files (Day One)
- `Code of Conduct`: Standard Contributor Covenant v2.1 (contact: kmmuntasir@gmail.com).
- `CONTRIBUTING.md`: PR guidelines, Conventional Commits enforced.
- `PR / Issue templates`: For bug reports, feature requests, translation patches.
- `SECURITY.md`: How to report vulnerabilities.