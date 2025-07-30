# Atrium Tabs – Product Requirements Document (v1.0)

_Last updated: 30 Jul 2025_

## 1. Vision & Value Proposition
Bring back real‑time tab‑workspace switching for power users—minimal UI, zero cloud clutter, everything stored locally, open‑source under GPL‑3.

## 2. Target Audience
* **Primary:** Developers, researchers, and other power users who juggle dozens of tabs per topic.
* **Secondary:** Casual users wanting a cleaner workspace without complex dashboards.

## 3. Success Metrics (telemetry via daily heartbeat)
| Metric | Definition |
|--------|------------|
| Daily Active Users | Chrome open with extension installed on a given day |
| Avg Groups / User | Count **all** groups (incl. empty) per user |
| Avg Tabs / Group | Count **all** tabs (discarded & pinned) per user |

## 4. Functional Requirements
### Core (MVP)
1. **Real‑time group tracking** (add/close tabs instantly reflected).
2. **Instant switching** (current group tabs close, target opens; last active tab focused).
3. **Group creation**
   * Toolbar popup: text input at bottom.
   * "Save current window as new group" button with pre‑filled timestamp name.
4. **Group list UI** (popup): rows show _icon · name · count · lock_. Inline actions: close (if open elsewhere), staged delete, rename, expand/collapse.
5. **Group Management page**
   * Single‑column collapsible list ⟶ optional side‑by‑side (two cols).
   * Drag tabs (move; Ctrl‑drag to copy) always to end of target.
6. **Pinned‑tab rule**
   * Global when _Include Pinned Tabs_ = OFF (ignored by extension).
   * Per‑group when ON.
7. **Keyboard shortcuts**
   * Default: Ctrl/⌘ + Shift + 1‑9 (jump to group).
   * All hotkeys remappable in Settings → Hotkeys.
8. **Settings page (full‑tab)**
   * Sort mode, Theme (light/dark/high‑contrast), Hotkeys mapper, Include Pinned checkbox, Storage warnings, Import/Export, Backups.
9. **High‑contrast (light‑theme only, bumped contrast).**
10. **Color‑blind cues**: 6‑shape badge cycle.
11. **Internationalization**: EN (default), FR, DE, IT, RU, ES – auto‑detect browser locale; JSON files in `/locales`.
12. **Telemetry (opt‑in, disabled by default)**
   * Crash dump, error log, daily heartbeat (group_count, tab_count) – max 3 hits/day/user via GA Measurement Protocol (UUID pseudo‑id).
13. **Backups**
   * Local export/import (plain‑text JSON, nested groups → tabs → fields).
   * Storage.quota warnings at 50 / 80 / 90 %. Block save at 100 %.
   * Safe‑Mode corruption modal with export / auto‑repair / fresh start.
14. **UI Languages**: auto‑switch; fallback EN.
15. **Icon assets**: provided SVG (#404040) + light inversion for dark mode; exported 16/32/48/128 PNGs.
16. **No badge overlay by default.**
17. **Update toast**: “Atrium updated to vX.Y”, 3 s fade, click → What’s New tab.

### Nice‑to‑Have / v2+
* Thumbnails & IndexedDB migration
* Google Drive hourly backups (keep 25; OAuth once)
* Playwright E2E tests
* Screen‑reader + full keyboard nav
* Cloud sync

## 5. User Workflows
1. **Daily power‑user flow**
   2. Browser auto‑restores last active group in each window.
   3. User opens/ closes tabs → extension updates storage.local real‑time.
   4. Ctrl‑Shift‑2 ⟶ switch to “Dev” group; last‑active tab auto‑focused.
5. **Create group** via popup input or "Save current window" button (name pre‑filled).
6. **Move tab**: right‑click tab bar → “Move tab to → [Group]” (instant move).
7. **Side‑by‑side management**: toggle icon ⟶ dual column; independent scroll & expand.
8. **Import & preview backup**: Settings → Backup → list of 25 Drive files → Preview (read‑only popup mimic) → Restore (confirmation + auto‑export current as fallback).

## 6. Data Model (storage.local)
### Group
| Field | Type | MVP |
|-------|------|-----|
| id | UUID | ✔ |
| name | string | ✔ |
| color | hex (opt) | ✔ |
| icon | string (Lucide/FA) | ✔ |
| lastActiveAt | ISO ts | ✔ |
| order | int | ✔ |
| tabs | Tab[] | ✔ |

### Tab
| Field | Type | MVP |
|-------|------|-----|
| url | string | ✔ |
| title | string | ✔ |
| pinned | bool | ✔ (ignored if global) |
| createdAt | ISO ts | opt |

## 7. Storage Strategy
* All data in `chrome.storage.local` (≈ 5 MB). Warnings at 50/80/90 %. Stop storing at 100%.
* Plain‑text JSON export/import (nested groups).

## 8. Permissions (Manifest Version 3)
`tabs`, `windows`, `storage`, `commands`, `contextMenus`, `alarms`, optional `https://www.google-analytics.com/` for telemetry.

## 9. Performance
* **Lazy‑load tabs** by default (discarded flag); eager toggle in Settings (warning banner).
* Remember last active tab per group; load it eagerly.

## 10. Accessibility
* High‑contrast (light only) + shape markers for color‑blind users.
* Keyboard nav & screen‑reader support deferred to v2.

## 11. Tech Stack
* **Frontend:** React 18 + TypeScript + Vite + SCSS + RadixUI, no Tailwind.
* **Lint:** ESLint (Airbnb TS) + Prettier.
* **Tests:** Vitest + React Testing Library (≥ 80 % coverage).
* **Build:** MV3 service‑worker, Min browser: Chrome 112+, Firefox 115 ESR+.

## 12. Repo & CI/CD
* GitHub public repo, `main` + `develop`.
* GitHub Actions: lint, unit tests, coverage ≥ 80 %, semantic‑release → tag, changelog, build, upload to Chrome Web Store **draft**.
* Community‑health files: CODE_OF_CONDUCT (Covenant v2.1, contact kmmuntasir@gmail.com), CONTRIBUTING (Conventional Commits), PR/Issue templates, SECURITY.md.

## 13. Store Listing Assets
* **Name:** Atrium Tabs
* **Tagline:** “Real‑time tab workspaces, simplified.”
* **Short description:** “Instantly switch, isolate, and manage tab workspaces without clutter. Minimal UI, power‑user hotkeys, fully local.”
* **Long description:** _see content above_
* **Screenshots:**
  1. Popup view (collapsed groups) – caption “Switch workspaces instantly.”
  2. Side‑by‑side management page – caption “Drag tabs across groups.”
  3. Settings page – caption “Power‑user settings, zero bloat.”

## 14. Roadmap After MVP
1. IndexedDB + tab thumbnails.
2. Google Drive automatic hourly backups (25 rolling).
3. Playwright E2E tests.
4. Screen‑reader + full keyboard nav.
5. Cloud sync across devices.

## 15. Finalized Decisions
* **Translation pipeline volunteer review process:** Community contributors submit GitHub PRs modifying `/locales/*.json`; Muntasir reviews and merges.
* **Toast position & styling:** Update toast appears at the **bottom‑right corner** of the popup, styled as a subtle elevated card with 80 % opacity background; auto‑fades after 3 s.
* **Legal review of telemetry disclosure:** Follow standard open‑source practice—privacy notice in README and Settings → Telemetry, outlining data sent (no URLs/identifiers), opt‑in nature, and GA Measurement Protocol usage.

---
_End of MVP PRD_