# React frontend

React version of the task-list assessment. It mirrors the Angular application in
`apps/frontend`.

## Run

From the repository root:

```bash
npm install
npm run build
npm run dev
```

The React frontend is served at <http://localhost:4300> and proxies `/api` to the
NestJS backend at <http://localhost:3000>.

## Status-change solution

The task list includes a per-task status selector. A successful update refreshes
the active list, while API failures display an error message.

Run this app's tests with:

```bash
npm test --workspace frontend-react
```
