# Error Handling & Storage Test Cases

## Storage Quota
- [ ] Should show persistent toast warning at 50% storage usage
- [ ] Should show persistent toast warning at 80% storage usage
- [ ] Should show persistent toast warning at 90% storage usage
- [ ] Should block save and show modal at 100% storage usage
- [ ] Should allow user to export or delete groups when storage is full

## Data Corruption & Safe-Mode
- [ ] Should detect data corruption on startup
- [ ] Should show safe-mode prompt with options: export raw data, attempt auto-repair, or start fresh
- [ ] Should attempt auto-repair and report result
- [ ] Should allow user to export raw data before repair or reset
- [ ] Should restore previous state if auto-repair fails

## Edge Cases
- [ ] Should handle rapid add/delete of groups/tabs without data loss
- [ ] Should handle storage quota edge cases (e.g., large import, backup restore)
- [ ] Should not allow saving if storage is full

## Integration
- [ ] Quota warnings and modals should update all extension views in real time
- [ ] Safe-mode actions should persist and sync across reloads