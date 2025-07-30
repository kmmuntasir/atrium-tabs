# Atrium Tabs – Development Plan (v1.0)

This task plan reflects the MVP PRD. Each task includes context, checklist format, and dependency wiring for structured implementation.

## 🧱 Phase 1: Project Setup & Tooling

- [ ] **1.0 Setup Vite + React + TypeScript project**  
  - [ ] Initialize with Vite template (`react-ts`)  
  - [ ] Configure SCSS support  
  - [ ] Install Radix UI core  
  - [ ] Setup ESLint (Airbnb) + Prettier  
  - [ ] Setup Vitest + React Testing Library  
  - [ ] Setup `src/`, `components/`, `pages/`, `utils/`, `hooks/` folders  
  _Depends on: None_

- [ ] **1.1 Initialize MV3 manifest and Chrome extension boilerplate**  
  - [ ] Create `manifest.json` with required permissions  
  - [ ] Setup service worker  
  - [ ] Wire popup.html  
  _Depends on: 1.0_

- [ ] **1.2 GitHub repo + CI pipeline**  
  - [ ] Init repo with `main` and `develop`  
  - [ ] Add GitHub Actions for lint/test/coverage  
  - [ ] Add PR templates, CODE_OF_CONDUCT, SECURITY.md  
  _Depends on: 1.0_

## 🧠 Phase 2: Core Architecture & Storage

- [ ] **2.0 Define data models for Group and Tab**  
  - [ ] TypeScript interfaces for Group and Tab (with fields from PRD)  
  - [ ] UUIDs for groups and nested tabs  
  _Depends on: 1.0_

- [ ] **2.1 Implement storage wrapper (localStorage abstraction)**  
  - [ ] Use `chrome.storage.local`  
  - [ ] Read/write/clear with error handling  
  - [ ] Integrate lazy storage warning at 50/80/90%  
  _Depends on: 2.0_

## 💻 Phase 3: Popup UI

- [ ] **3.0 Design popup layout**  
  - [ ] Create vertical list of groups with bottom Add Group input  
  - [ ] Show: icon, name, tab count, lock icon  
  _Depends on: 1.0, 2.0_

- [ ] **3.1 Group list row features**  
  - [ ] Click to switch  
  - [ ] Close (if in another window)  
  - [ ] Stage delete + restore  
  - [ ] Rename (inline)  
  - [ ] Expand/collapse  
  - [ ] Inline icon + color selector  
  _Depends on: 3.0_

- [ ] **3.2 Add group interaction**  
  - [ ] Text input → name → group added  
  - [ ] Don’t switch on creation  
  - [ ] “Save window as group” with timestamp naming  
  _Depends on: 3.0, 2.1_

## 🧩 Phase 4: Group Management Page

- [ ] **4.0 Build single-column view of all groups**  
  - [ ] Reuse popup group rows  
  - [ ] Expand/collapse per group  
  - [ ] Per-tab row: favicon, title, drag icon, close icon  
  _Depends on: 3.1_

- [ ] **4.1 Implement drag-n-drop between groups**  
  - [ ] Default = move; Ctrl+Drag = copy  
  - [ ] Always to bottom of target group  
  _Depends on: 4.0_

- [ ] **4.2 Add side-by-side toggle view**  
  - [ ] Show two independently scrollable columns  
  - [ ] Reuse same group list view in both  
  _Depends on: 4.1_

## 🧠 Phase 5: Tab & Window Behavior

- [ ] **5.0 Real-time group tracking**  
  - [ ] Listen to tab create/close events  
  - [ ] Update correct group in storage  
  _Depends on: 2.1_

- [ ] **5.1 Group switching logic**  
  - [ ] Switch closes all tabs of current group  
  - [ ] Opens all tabs of target group  
  - [ ] Optionally restore pinned tabs  
  _Depends on: 5.0_

- [ ] **5.2 Handle pinned tab mode**  
  - [ ] Toggle in Settings: OFF = global, ON = per-group  
  - [ ] Persist pinned state in group if ON  
  _Depends on: 5.1_

## 🛠️ Phase 6: Settings Page

- [ ] **6.0 Create full-page tabbed settings page**  
  - [ ] Sections: General, Hotkeys, Theme, Import/Export, Backup  
  _Depends on: 1.0_

- [ ] **6.1 Add sorting options**  
  - [ ] Alphabetical (asc/desc), Last Used  
  - [ ] Only allow drag-n-drop in manual mode  
  _Depends on: 6.0_

- [ ] **6.2 Theme selector (light/dark/auto/high contrast)**  
  - [ ] Match system  
  - [ ] Apply background color rules  
  _Depends on: 6.0_

- [ ] **6.3 Hotkey mapping UI**  
  - [ ] Show shortcut list (jump to group, etc)  
  - [ ] Allow key remap  
  _Depends on: 6.0_

- [ ] **6.4 JSON Import / Export**  
  - [ ] Add full Import flow: parse, preview, confirm  
  - [ ] Add Export: download with metadata  
  _Depends on: 2.1, 6.0_

- [ ] **6.5 Backup preview & restore**  
  - [ ] Show 25 backups in scrollable list  
  - [ ] Preview mimics popup (read-only)  
  - [ ] “Restore” button with confirmation  
  _Depends on: 6.4_

## 🌐 Phase 7: Additional Features

- [ ] **7.0 i18n: Locales and Language Auto-detect**  
  - [ ] Add `en`, `fr`, `de`, `it`, `es`, `ru` to `/locales`  
  - [ ] Use browser locale, fallback to `en`  
  _Depends on: 1.0_

- [ ] **7.1 Telemetry (opt-in)**  
  - [ ] GA MP endpoint integration  
  - [ ] Track: crash log, errors, heartbeat (tab+group count)  
  _Depends on: 2.1_

- [ ] **7.2 Update toast + What's New tab**  
  - [ ] Show on update, fade after 3s  
  - [ ] Click → opens What’s New page  
  _Depends on: 1.1_