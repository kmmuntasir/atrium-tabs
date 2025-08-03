## Project Structure & Setup

### [ATRIUM-0001] Project Repository Initialization
**Description:**
Initialize the git repository, set up the base directory structure, and add essential configuration files (README, LICENSE, .gitignore).

**Acceptance Criteria:**
- Repository exists on GitHub with correct name and description.
- README, LICENSE, and .gitignore present and populated.
- Directory structure for `extension/src/`, `extension/public/`, `extension/docs/`, and `extension/test/` exists.
- Unit test: N/A
- Integration test: N/A

### [ATRIUM-0002] Tooling & Linting Setup
**Description:**
Configure ESLint, Prettier, TypeScript, and commit hooks for code quality and consistency.

**Acceptance Criteria:**
- ESLint with Airbnb TypeScript config and plugins for React/hooks.
- Prettier integrated with ESLint.
- TypeScript config with strict mode.
- Husky or similar for pre-commit lint/test.
- Unit test: Linting errors are caught on commit.
- Integration test: N/A

**Dependencies:** ATRIUM-0001

### [ATRIUM-0003] Vite & React Project Bootstrap
**Description:**
Set up Vite as the bundler and React as the UI framework, with TypeScript and Radix UI primitives.

**Acceptance Criteria:**
- Vite project boots and runs a React+TS app.
- Radix UI primitives installed and imported in a sample component.
- Unit test: App renders a sample component.
- Integration test: N/A

**Dependencies:** ATRIUM-0002