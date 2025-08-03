ATRIUM-0049, ATRIUM-0050, ATRIUM-0051: Implemented storage quota warnings, storage full modal, and data corruption safe-mode prompt with auto-repair functionality.
ATRIUM-0052: Implemented opt-in telemetry and metrics with persistent daily rate limiting and daily heartbeat, including group and tab counts.
ATRIUM-0052: Added unit tests for telemetry and metrics module, covering opt-in, data sent, and rate limiting.
ATRIUM-0053: Implemented color-blind shape badge with ARIA label for group icons.
ATRIUM-0054: Ensured all interactive UI elements have ARIA labels and keyboard navigation support.
ATRIUM-0060: Implemented lazy/eager loading for tabs based on user preference, including `discarded` property in Tab model and `undiscardTab` function in background.js.
ATRIUM-0060: Integrated `react-window` for UI virtualization in `GroupList.tsx` to optimize performance for large numbers of groups.
ATRIUM-0060: Added `generateMockData` utility in `src/utils/storage.ts` and a UI button in `GroupList.tsx` for manual performance testing with mock data.
ATRIUM-0061: Added `tabs` and `activeTab` permissions to `manifest.json` for core tab and group management functionality.
ATRIUM-0061: Implemented Content Security Policy (`CSP`) with `default-src 'self'` in `manifest.json`.