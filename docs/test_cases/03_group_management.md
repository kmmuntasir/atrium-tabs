# Group Management Test Cases

## Group Creation & Editing
- [ ] Should allow creating a new group with manual name input
- [ ] Should auto-name group when saving current window as new group
- [ ] Should assign unique color and icon to new group
- [ ] Should allow inline editing of group name
- [ ] Should update group color and icon via selector UI
- [ ] Should not allow duplicate group names (auto-suffix or reject)
- [ ] Should keep/display groups with zero tabs

## Group Deletion & Restore
- [ ] Should soft delete group on first delete click (row grays out, restore icon appears)
- [ ] Should confirm deletion on second delete click
- [ ] Should allow restoring a closed group from soft delete state
- [ ] Should remove group and all tabs from storage on final delete

## Group Reordering & Sorting
- [ ] Should allow manual drag-and-drop reordering of groups (manual sort mode only)
- [ ] Should persist group order after reload
- [ ] Should allow user to set group sort order (alphabetical, last used, manual)
- [ ] Should update group list per selected sort order

## Multi-Window & Lock Icon
- [ ] Should support one active group per window
- [ ] Should show lock icon and disable group if active in another window
- [ ] Should show correct tooltip for lock icon
- [ ] Should prevent activating a group in more than one window

## Open in New Window
- [ ] Should allow opening a group in a new Chrome window
- [ ] Should update group state when opened/closed in new window

## Edge Cases
- [ ] Should handle group with zero tabs (switching opens new blank tab)
- [ ] Should handle long group names, special characters, and empty names (validation)
- [ ] Should persist all group changes (create, edit, delete, reorder, restore) across reloads

## Integration
- [ ] Group list should update in real time as groups are managed
- [ ] Group state should sync correctly across multiple windows