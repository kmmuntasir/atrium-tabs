# Tab Management Test Cases

## Tab Add/Remove/Update
- [ ] Should add new tab to active group in real time
- [ ] Should remove tab from group via close icon
- [ ] Should update tab title, favicon, and pinned status
- [ ] Should persist tab changes across reloads
- [ ] Should handle tab with missing favicon or title gracefully

## Tab Reordering & Moving
- [ ] Should allow drag-and-drop reordering of tabs within a group
- [ ] Should persist tab order after reload
- [ ] Should allow moving tab between groups via drag-and-drop
- [ ] Should allow copying tab between groups via Ctrl+Drag
- [ ] Should update groupId when tab is moved

## Context Menu
- [ ] Should show context menu on tab bar for moving tab to group
- [ ] Should move tab to selected group from context menu

## Pinned Tabs
- [ ] Should include/exclude pinned tabs in groups based on setting
- [ ] Should persist pinned tab behavior across reloads
- [ ] Should handle edge case: switching setting updates pinned tab state correctly

## Real-Time Tracking & Focus
- [ ] Should track tab open, close, and navigation events in real time
- [ ] Should update UI and storage on all tab events
- [ ] Should focus last active tab on group switch

## Edge Cases
- [ ] Should open new blank tab when switching to empty group
- [ ] Should handle large number of tabs (performance)
- [ ] Should handle tabs with duplicate URLs or titles

## Integration
- [ ] Tab list should update in real time as tabs are managed
- [ ] Tab state should sync correctly across group switches and window changes