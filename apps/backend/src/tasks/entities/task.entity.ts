import { TaskStatus } from '../enums/task-status.enum';

/** Domain representation of a task as stored in the database. */
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  /** Creation timestamp stored as an ISO 8601 string. */
  createdAt: string;
}
