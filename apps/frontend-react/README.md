# React frontend

React version of the task-list assessment. It mirrors the Angular application in
`apps/frontend`, including the intentionally unfinished status-change feature.

## Run

From the repository root:

```bash
npm install
npm run build
npm run dev
```

The React frontend is served at <http://localhost:4300> and proxies `/api` to the
NestJS backend at <http://localhost:3000>.

## Candidate task

Complete the two `TODO` comments in `src/tasks/TaskList.tsx`:

- Add a control that lets the user choose a new status for each task.
- Implement `changeStatus(task, status)` with `taskService.updateStatus`, then
  refresh the list.

Run this app's tests with:

```bash
npm test --workspace frontend-react
```
