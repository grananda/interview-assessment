import type { TaskStatus } from './task-status';

/**
 * The task contract exchanged over the API — the single source of truth shared
 * by the Nest backend (response shape) and the Angular frontend (model).
 * `createdAt` is a date-only string (YYYY-MM-DD).
 */
export interface TaskDto {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}
