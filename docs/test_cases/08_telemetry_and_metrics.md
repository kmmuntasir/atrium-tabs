# Telemetry & Metrics Test Cases

## Telemetry Opt-In
- [ ] Should default telemetry to opt-out (disabled)
- [ ] Should allow user to opt-in to telemetry in settings
- [ ] Should only send telemetry data when opt-in is enabled
- [ ] Should show clear description of data sent (no URLs, hostnames, or user-supplied strings)

## Data Sent
- [ ] Should send crash reports with stack trace, extension version, browser version, OS
- [ ] Should send error logs for non-fatal exceptions with environment metadata
- [ ] Should send daily heartbeat with group and tab counts
- [ ] Should not send any user identifiers or sensitive data
- [ ] Should generate and store random UUID for telemetry (user_pseudo_id)
- [ ] Should persist UUID across sessions

## Metrics
- [ ] Should define and document daily active users, average groups per user, average tabs per group per user
- [ ] Should include metrics in telemetry payloads

## Rate Limiting
- [ ] Should limit telemetry to max 3 hits per user per day
- [ ] Should trigger heartbeat only on first background wakeup each day

## Edge Cases
- [ ] Should handle telemetry service unavailability gracefully
- [ ] Should not send duplicate or excessive telemetry events

## Integration
- [ ] Telemetry settings and data should persist and sync across all extension views
- [ ] Metrics should update in real time and reflect actual usage