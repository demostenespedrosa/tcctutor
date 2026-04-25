# Security Specification - TCC Tutor

## 1. Data Invariants
- **User Integrity**: A user cannot change their own role.
- **Project Privacy**: Only members or professors can see project details (phases, student list).
- **Project Integrity**: Students can only join projects they have a token for (enforced by client, but protected in rules by restricted field updates).
- **Kanban Security**: Only members or professors can create/edit/delete cards in a project.
- **Auditability**: `lastInteraction` must be updated on all project-related changes.

## 2. The "Dirty Dozen" Payloads

1. **Self-Promotion**: Student tries to update their own role to 'PROFESSOR'.
   - `PUT /users/{studentId} { role: 'PROFESSOR' }`
2. **Project Hijack**: User tries to add themselves to `memberIds` of a project they don't belong to without using the valid join flow.
   - `PATCH /projects/{projectId} { memberIds: [..., 'attackerId'] }`
3. **Card Erasure**: Unauthenticated user tries to delete cards.
   - `DELETE /projects/{projectId}/cards/{cardId}`
4. **Member Scraping**: Unauthenticated user tries to list all projects.
   - `GET /projects`
5. **Phase Sabotage**: Student tries to change a phase status of another group.
   - `PATCH /projects/{notMyProjectId} { phases: { 1: { status: 'APPROVED' } } }`
6. **Token Guessing**: User tries to fetch a project by ID guessing. (Allowed to fetch if token matches, but list is restricted).
7. **Phantom User**: User tries to create a user document with a different UID.
   - `POST /users/{differentId} { ... }`
8. **Shadow Field injection**: User tries to add `isSecretAdmin: true` to their user doc.
   - `PATCH /users/{myId} { name: 'John', role: 'STUDENT', isSecretAdmin: true }`
9. **Professor Impersonation**: Student tries to list projects using a query they shouldn't.
10. **Card Poisoning**: Student tries to create a card with 1MB of text in description.
11. **Phase Feedback Manipulation**: Student tries to update the `feedback` field of a phase (only Professor should).
12. **Zombie Project**: User tries to update `token` of an existing project.

## 3. Test Runner (Draft)

```typescript
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

// Note: In AI Studio we don't have a full emulator runner in standard turns,
// but we define this for architectural compliance.
```
