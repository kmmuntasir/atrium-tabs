# Atrium Tabs - Security Review and Permissions Justification

## 1. Permissions Justification

This section outlines the permissions requested by the Atrium Tabs Chrome Extension and provides a justification for each, adhering to the Principle of Least Privilege.

- **`storage`**: 
  - **Justification**: Essential for storing all user data locally, including tab groups, individual tabs, and user preferences (theme, sort order, pinned tabs setting, eager load, hotkeys, telemetry opt-in, high contrast mode). This permission enables the core functionality of the extension, ensuring data persistence across browser sessions.

- **`alarms`**: 
  - **Justification**: Used to schedule periodic events, specifically for the daily heartbeat of the opt-in telemetry feature. This allows for anonymous usage data (total groups, total tabs) to be sent without requiring the extension popup to be open constantly, contributing to understanding user engagement and resource utilization.

- **`tabs`**: 
  - **Justification**: Crucial for managing browser tabs and implementing the core real-time tab group switching functionality. This includes:
    - Creating new tabs when a group is activated or an empty group is switched to.
    - Removing tabs when a group is deactivated.
    - Querying tab information (URL, title, favicon, pinned status).
    - Updating tab properties (e.g., active state, discarded state for lazy loading).
    - Discarding tabs for performance optimization in lazy-load mode.

- **`activeTab`**: 
  - **Justification**: Provides temporary access to the active tab when the user invokes the extension (e.g., by clicking the extension icon). This permission is generally considered safer than `tabs` for certain operations because it is granted temporarily by a user gesture. It is needed for features like "Save current window as new group" which needs information about the currently active window and its tabs.

## 2. Security Review Summary

This section summarizes the security measures and findings from the codebase review.

### 2.1 Content Security Policy (CSP)

- **Implementation**: A strict CSP (`"extension_pages": "default-src 'self';"`) has been added to `manifest.json`. This policy restricts the sources from which the extension can load resources (scripts, stylesheets, images, etc.) to only its own package, significantly mitigating risks like XSS and code injection from external sources.

### 2.2 Input Sanitization

- **Review**: Components handling user input (`GroupList.tsx`, `TabList.tsx`, `Settings.tsx`) were reviewed. 
- **Finding**: React's automatic escaping of text content in JSX and proper handling of input element `value` attributes effectively prevent HTML injection XSS vulnerabilities for user-provided data such as group names, tab titles, and URLs.

### 2.3 Data Handling and Storage

- **Mechanism**: All persistent application data (groups, tabs, preferences) is stored using `chrome.storage.local`, which is the recommended secure storage for Chrome Extensions.
- **Sensitive Data**: No highly sensitive Personally Identifiable Information (PII) or user credentials are intentionally stored by the extension.
- **Telemetry**: The telemetry feature is strictly opt-in and designed to collect only anonymous usage data (e.g., group/tab counts) without PII, adhering to privacy best practices.
- **`localStorage` Usage**: `localStorage` is used only for non-sensitive UI preferences (e.g., expanded groups, sort order), which is acceptable.
- **Imported Data Validation**: While `isValidGroup` and `isValidTab` functions exist for data integrity checks, explicit deep validation/sanitization of *imported* JSON data against malicious payloads is not fully implemented beyond basic JSON parsing. This is a potential future enhancement for robustness, though not a direct XSS vector given current rendering practices.

### 2.4 Third-Party Dependencies

- **Audit**: `npm audit` was run to check for known vulnerabilities in third-party packages.
- **Finding**: No known vulnerabilities were reported (`found 0 vulnerabilities`).

### 2.5 Content Scripts

- **Usage**: The extension does not declare or use content scripts that inject directly into web pages.
- **Interaction Model**: Interaction with browser tabs and their content is primarily managed by the `background.ts` service worker using the `tabs` permission from its isolated environment. This approach minimizes exposure to the web page's DOM and reduces related security risks like DOM-based data skimming.

## 3. Future Security Enhancements (Beyond MVP)

- **Strict Input Validation for Imports**: Implement more rigorous schema validation and sanitization for imported JSON data to ensure robustness against malformed or malicious backup files.
- **Context Menus Permission**: When the "Context Menu Integration" feature (right-clicking a tab to move it) is implemented, the `contextMenus` permission will need to be added and justified.
- **Privacy Policy Document**: Create a dedicated, clear, and comprehensive privacy policy document (as noted in PRD).