## Error Handling & Storage

### [ATRIUM-0049] Storage Quota Warnings (Persistent Toast at 50%, 80%, 90%)
**Description:**
Show persistent toast warnings as storage approaches quota.

**Acceptance Criteria:**
- Toasts appear at 50%, 80%, 90% usage.
- Unit test: Quota logic.
- Integration test: Toasts display at correct thresholds.

**Dependencies:** ATRIUM-0009

### [ATRIUM-0050] Block Save and Show Modal at 100% Storage
**Description:**
Block saving and show modal when storage is full.

**Acceptance Criteria:**
- Modal blocks save at 100%.
- Unit test: Block logic.
- Integration test: Modal appears and blocks actions.

**Dependencies:** ATRIUM-0049

### [ATRIUM-0051] Safe-Mode Prompt and Auto-Repair for Data Corruption
**Description:**
Show safe-mode prompt and attempt auto-repair if data corruption is detected.

**Acceptance Criteria:**
- Safe-mode modal appears on corruption.
- Auto-repair attempts and reports result.
- Unit test: Corruption detection/repair logic.
- Integration test: Prompt appears on simulated corruption.

**Dependencies:** ATRIUM-0050