# Technical Assessment — Tasks App (Angular + NestJS)

Small full‑stack app for a coding assessment. It's a task list: the backend exposes a REST API over SQLite and the frontend (Angular) shows the tasks and lets you filter them by status.

Your job is to **complete two small features** (one in the backend, one in the frontend) and be ready to **explain your code** and answer questions about it.

---

## Stack

| Area      | Tech                                                             |
| --------- | --------------------------------------------------------------- |
| Monorepo  | Turborepo + npm workspaces                                       |
| Backend   | NestJS 11, SQLite (`better-sqlite3`), `class-validator`, caching |
| Frontend  | Angular 22 (standalone components, signals), Vitest             |
| Shared    | `@repo/shared` — DTOs and the `TaskStatus` enum shared by both   |

```
apps/
  backend/    NestJS REST API  → http://localhost:3000/api
  frontend/   Angular SPA      → http://localhost:4200
packages/
  shared/     Types/DTOs shared between backend and frontend
```

---

## Prerequisites

- Node.js **>= 18**
- npm **10+**

## Setup & run

From the repository root:

```bash
npm install      # install all workspaces
npm run build    # build the shared package + apps (do this once first)
npm run dev      # start backend (:3000) and frontend (:4200) together
```

Then open **http://localhost:4200**. The frontend proxies `/api` to the backend automatically (see `apps/frontend/proxy.conf.json`), so you don't need to configure anything.

> If the first `npm run dev` fails because `@repo/shared` can't be resolved, run `npm run build` once and start again.

### Useful commands

```bash
npm run check-types      # TypeScript typecheck across the monorepo
npm run lint             # lint

# Backend tests (from apps/backend)
npm test                 # unit tests
npm run test:e2e         # e2e tests

# Frontend tests (from apps/frontend)
npm test                 # Vitest
```

### API overview

| Method | Route                    | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| GET    | `/api/tasks?status=`     | List tasks, optional status filter   |
| GET    | `/api/tasks/:id`         | Get one task (404 if missing)        |
| PUT    | `/api/tasks/:id/status`  | Update a task's status ← **Task 1**  |

`TaskStatus` values: `pending`, `in_progress`, `done`.

---

## Your tasks

### Task 1 — Backend: implement `PUT /api/tasks/:id/status`

**File:** `apps/backend/src/tasks/controllers/tasks.controller.ts`

The controller method `updateStatus` currently throws *"Not implemented yet"*. Implement the endpoint so it:

- Reads the task `id` from the route and the new status from the request body.
- Updates the task and returns the updated task as a `TaskResponseDto`.
- Returns **404** when the task does not exist.

Everything you need already exists: `TasksService.updateStatus`, the repository, the input DTO (`UpdateTaskStatusDto`), the response DTO (`TaskResponseDto`) and the domain error (`TaskNotFoundError`). Look at the existing `findAll` / `findOne` methods for the patterns used in this codebase.

### Task 2 — Frontend: let the user change a task's status

**Files:** `apps/frontend/src/app/tasks/task-list/task-list.ts` and `task-list.html`

- Add a control in the template (marked with a `TODO`) that lets the user change a task's status.
- Implement `changeStatus(task, status)` so it calls the API and refreshes the list afterwards.

`TaskService.updateStatus(id, status)` already exists — wire it up.

---

## What we'll look at

- Correctness and that it actually works end‑to‑end (change a status in the UI and see it persist).
- Consistency with the existing patterns and layering of the codebase.
- Your ability to **explain** the existing code and the decisions you made.

Good luck! 🚀
