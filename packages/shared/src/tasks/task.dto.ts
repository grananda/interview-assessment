import type { TaskStatus } from './task-status';

/** Task contract exchanged over the API, shared by backend and frontend. */
export interface TaskDto {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}
