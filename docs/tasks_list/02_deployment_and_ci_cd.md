## Deployment & CI/CD

### [ATRIUM-0004] GitHub Actions CI Pipeline
**Description:**
Configure GitHub Actions for linting, testing, and building on PRs and main branch.

**Acceptance Criteria:**
- Lint, test, and build jobs run on PR and push.
- Failing jobs block merge.
- Unit test: CI fails on lint/test errors.
- Integration test: CI passes on clean branch.

**Dependencies:** ATRIUM-0003

### [ATRIUM-0005] Semantic Release & Changelog Automation
**Description:**
Integrate semantic-release for automated versioning, changelog generation, and release tagging.

**Acceptance Criteria:**
- Commits with Conventional Commits format trigger version bump and changelog update.
- CHANGELOG.md is generated and updated.
- Unit test: N/A
- Integration test: Release is created on merge to main.

**Dependencies:** ATRIUM-0004

### [ATRIUM-0006] Chrome Web Store Draft Upload Automation
**Description:**
Set up GitHub Actions to upload builds as drafts to the Chrome Web Store.

**Acceptance Criteria:**
- Build artifacts are uploaded as drafts on release.
- Credentials are stored securely as GitHub Secrets.
- Unit test: N/A
- Integration test: Draft appears in Chrome Web Store dashboard after release.

**Dependencies:** ATRIUM-0005

### [ATRIUM-0007] Community Health Files
**Description:**
Add Code of Conduct, CONTRIBUTING.md, PR/Issue templates, and SECURITY.md.

**Acceptance Criteria:**
- All files present in repo root.
- Unit test: N/A
- Integration test: Templates appear on GitHub when opening PR/issue.

**Dependencies:** ATRIUM-0001