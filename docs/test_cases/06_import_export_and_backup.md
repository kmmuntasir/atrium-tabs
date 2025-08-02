# Import/Export & Backup Test Cases

## Export
- [ ] Should export all groups, tabs, and preferences as a JSON file
- [ ] Exported JSON should match defined schema
- [ ] Exported file should be importable without errors
- [ ] Should allow user to choose save location for export

## Import
- [ ] Should import JSON backup and replace or merge data as selected
- [ ] Should generate new UUIDs for imported groups and tabs
- [ ] Should resolve group name collisions with numeric suffix
- [ ] Should handle invalid or corrupted import files gracefully
- [ ] Should preview backup before restoring
- [ ] Should show confirmation prompt before overwriting current data
- [ ] Should restore data from backup and update UI

## Backup Preview & Restore
- [ ] Should list recent backups in settings
- [ ] Should show structured, read-only preview of backup (mimics popup UI)
- [ ] Should allow toggling between structured and raw code view
- [ ] Should restore from selected backup and update all data

## Translation & Localization
- [ ] Should allow community translation PRs and bundle new translations
- [ ] Should auto-switch extension language to browser/OS language if supported
- [ ] Should fall back to English if locale not available
- [ ] Should load translations from static JSON files in /locales
- [ ] Should update UI language in real time

## Edge Cases
- [ ] Should handle import/export with large data sets (performance)
- [ ] Should handle missing or malformed fields in import/export
- [ ] Should prevent data loss on failed import (restore previous state)

## Integration
- [ ] Import/export actions should update all extension views and storage
- [ ] Localization changes should persist and sync across all UI