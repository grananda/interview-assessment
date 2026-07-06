import type { TaskSchema } from '../schemas/task.schema';
import { TaskStatus } from '@repo/shared';

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
    task.status = Task.toStatus(row.status);
    task.createdAt = row.created_at;
    return task;
  }

  /**
   * Validates the raw status string against the domain enum instead of blindly
   * casting it, so a corrupt/unknown value in the store fails fast and loud.
   */
  private static toStatus(value: string): TaskStatus {
    const statuses = Object.values(TaskStatus) as string[];
    if (!statuses.includes(value)) {
      throw new Error(`Invalid task status from store: "${value}"`);
    }
    return value as TaskStatus;
  }
}
