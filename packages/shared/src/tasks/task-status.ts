/** Lifecycle states a task can be in. Shared contract for backend and frontend. */
export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Done = 'done',
}
