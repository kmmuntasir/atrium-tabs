# Data Model Test Cases

## Group Model

- [ ] Should create a group with valid UUID, name, timestamps, color, icon, and order
- [ ] Should not allow creation of a group with missing required fields (name, UUID)
- [ ] Should update group name and timestamps correctly
- [ ] Should assign and persist color and icon
- [ ] Should maintain correct manual order and lastActiveAt
- [ ] Should delete a group and remove it from storage
- [ ] Should restore a deleted group (soft delete)
- [ ] Should persist groups in local storage and restore on reload
- [ ] Should handle edge case: duplicate group names (auto-suffix or reject)
- [ ] Should handle edge case: group with zero tabs remains in list
- [ ] Should not allow a group to be active in more than one window

## Tab Model

- [ ] Should create a tab with valid URL, title, pinned, groupId, favicon, createdAt
- [ ] Should not allow creation of a tab with missing required fields (URL, groupId)
- [ ] Should update tab title, favicon, and pinned status
- [ ] Should delete a tab and remove it from group
- [ ] Should persist tabs in local storage and restore on reload
- [ ] Should handle edge case: tab with missing favicon or title
- [ ] Should handle edge case: pinned tab logic per settings
- [ ] Should assign correct groupId and update on move between groups

## Integration

- [ ] Switching groups should save current group's tab state and restore selected group's tabs
- [ ] Deleting a group should remove all associated tabs
- [ ] Importing groups/tabs should generate new UUIDs and resolve name collisions
- [ ] Exported JSON should match schema and be importable
- [ ] Storage quota warnings should trigger at 50%, 80%, 90%
- [ ] Block save and show modal at 100% storage
- [ ] Safe-mode prompt and auto-repair should trigger on data corruption