# Accessibility & Onboarding Test Cases

## High-Contrast & Color-Blind
- [ ] Should allow enabling high-contrast theme (light mode)
- [ ] Should update UI to high-contrast palette when enabled
- [ ] Should show color-blind shape badge next to each group icon
- [ ] Should cycle through 6 shapes for color-blind badge
- [ ] Should add ARIA label to shape badge

## ARIA & Keyboard Navigation
- [ ] All interactive UI elements should have ARIA labels
- [ ] Should support keyboard navigation for all actions (tab, enter, arrows, etc.)
- [ ] Should pass automated accessibility tests (axe, etc.)

## Onboarding Carousel
- [ ] Should show 3-step onboarding carousel on first run
- [ ] Should display screenshots/GIFs for each step
- [ ] Should allow user to skip or finish onboarding
- [ ] Should show “Hotkeys active” toast after onboarding is completed or skipped
- [ ] Should close carousel and land on Settings page root after onboarding

## Edge Cases
- [ ] Should handle onboarding re-entry (e.g., via settings)
- [ ] Should persist onboarding completion state across reloads

## Integration
- [ ] Accessibility and onboarding features should persist and sync across all extension views
- [ ] Accessibility settings should update UI in real time