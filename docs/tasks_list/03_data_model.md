## Data Model

### [ATRIUM-0008] Group Data Model Implementation
**Description:**
Implement the Group data model (UUID, name, timestamps, color, icon, order, lastActiveAt).

**Acceptance Criteria:**
- TypeScript interfaces/types for Group.
- CRUD operations for groups in local storage.
- Unit tests: Model validation, CRUD logic.
- Integration test: Groups persist and restore on reload.

**Dependencies:** ATRIUM-0003

### [ATRIUM-0009] Tab Data Model Implementation
**Description:**
Implement the Tab data model (URL, title, pinned, groupId, favicon, createdAt).

**Acceptance Criteria:**
- TypeScript interfaces/types for Tab.
- CRUD operations for tabs in local storage.
- Unit tests: Model validation, CRUD logic.
- Integration test: Tabs persist and restore on reload.

**Dependencies:** ATRIUM-0008