import type { TaskSchema } from '../schemas/task.schema';
import { TaskStatus } from '../enums/task-status.enum';

/** Domain representation of a task, as used across the application. */
export class Task {
  id!: number;
  title!: string;
  description!: string;
  status!: TaskStatus;
  /** Creation timestamp stored as an ISO 8601 string. */
  createdAt!: string;

  /** Builds a domain Task from a raw persistence row (snake_case -> camelCase). */
  static fromSchema(row: TaskSchema): Task {
    const task = new Task();
    task.id = row.id;
    task.title = row.title;
    task.description = row.description;
    task.status = row.status as TaskStatus;
    task.createdAt = row.created_at;
    return task;
  }
}
