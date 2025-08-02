## Import/Export & Backup

### [ATRIUM-0043] Export Groups, Tabs, and Preferences as JSON
**Description:**
Allow exporting all groups, tabs, and preferences as a JSON file.

**Acceptance Criteria:**
- Export button in settings.
- JSON file downloads with correct schema.
- Unit test: Export logic.
- Integration test: File downloads and can be imported.

**Dependencies:** ATRIUM-0036

### [ATRIUM-0044] Import JSON Backup (Replace or Merge, Handle UUIDs and Name Collisions)
**Description:**
Allow importing a JSON backup, with options to replace or merge data, handling UUIDs and name collisions.

**Acceptance Criteria:**
- Import button in settings.
- Replace/merge options shown.
- UUIDs and names handled per spec.
- Unit test: Import/merge logic.
- Integration test: Data imports and merges correctly.

**Dependencies:** ATRIUM-0043

### [ATRIUM-0045] Preview Backups (Structured, Read-Only View)
**Description:**
Show a structured, read-only preview of backups before restoring.

**Acceptance Criteria:**
- Preview UI shows groups/tabs from backup.
- No actions enabled.
- Unit test: Preview logic.
- Integration test: Preview loads from file.

**Dependencies:** ATRIUM-0044, ATRIUM-0013

### [ATRIUM-0046] List and Restore Recent Backups
**Description:**
List recent backups and allow restoring from them.

**Acceptance Criteria:**
- List of backups in settings.
- Restore button for each.
- Unit test: Restore logic.
- Integration test: Data restores from backup.

**Dependencies:** ATRIUM-0045

### [ATRIUM-0047] Community Translation Pipeline
**Description:**
Set up pipeline for community-contributed translations via GitHub PRs.

**Acceptance Criteria:**
- CONTRIBUTING.md documents translation process.
- PRs for translations are reviewed and merged.
- Unit test: N/A
- Integration test: New translations appear in extension after merge.

**Dependencies:** ATRIUM-0007

### [ATRIUM-0048] Localization: Auto-Switch to Browser/OS Language
**Description:**
Implement localization with static JSON files in `/locales`, auto-switching to browser/OS language.

**Acceptance Criteria:**
- Locales directory with translation files.
- Language auto-detects and switches.
- Unit test: Localization logic.
- Integration test: UI updates to selected language.

**Dependencies:** ATRIUM-0047