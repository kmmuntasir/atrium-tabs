## Telemetry & Metrics

### [ATRIUM-0052] Telemetry Opt-In (Crash/Error/Heartbeat, No URLs/Hostnames)
**Description:**
Implement opt-in telemetry for crash/error/heartbeat events, excluding URLs/hostnames.

**Acceptance Criteria:**
- Opt-in toggle in settings.
- Only allowed data sent.
- Unit test: Telemetry logic.
- Integration test: Data sent only when enabled.

**Dependencies:** ATRIUM-0036

### [ATRIUM-0053] Generate/Store Random UUID for Telemetry
**Description:**
Generate and store a random UUID for telemetry purposes.

**Acceptance Criteria:**
- UUID generated and stored locally.
- Unit test: UUID logic.
- Integration test: UUID persists across sessions.

**Dependencies:** ATRIUM-0052

### [ATRIUM-0054] Define and Document Key Metrics
**Description:**
Define and document metrics (daily active users, average groups/tabs per user).

**Acceptance Criteria:**
- Metrics definitions in docs.
- Unit test: N/A
- Integration test: Metrics appear in telemetry payloads.

**Dependencies:** ATRIUM-0052