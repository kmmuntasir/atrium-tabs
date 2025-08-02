# Settings & Customization Test Cases

## Settings Screen
- [ ] Should open full-page settings screen from popup
- [ ] Should display all settings sections (sort, theme, import/export, hotkeys, pinned tabs, etc.)
- [ ] Should persist settings changes across reloads

## Theme & Icon
- [ ] Should toggle between light and dark themes
- [ ] Should sync theme with browser/system if enabled
- [ ] Should update extension icon to match selected theme
- [ ] Should persist theme and icon changes

## Hotkeys & Keyboard Mapping
- [ ] Should display keyboard shortcut mapping UI
- [ ] Should allow user to map hotkeys for group switching and other actions
- [ ] Should set up default hotkeys (Ctrl/Cmd+Shift+1-9) for group switching
- [ ] Should update and persist custom hotkeys
- [ ] Should trigger group switch on hotkey press

## Lazy/Eager Load
- [ ] Should toggle between lazy-load and eager-load for tabs
- [ ] Should show warning when eager-load is enabled
- [ ] Should load tabs per selected mode

## ARIA & Accessibility
- [ ] All settings UI elements should have ARIA labels
- [ ] Should support keyboard navigation for all settings actions

## Edge Cases
- [ ] Should handle invalid or conflicting hotkey mappings
- [ ] Should handle missing or corrupted settings data gracefully

## Integration
- [ ] Settings changes should update UI and behavior in real time
- [ ] Settings should persist and sync across all extension views