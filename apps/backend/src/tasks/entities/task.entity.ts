import type { TaskSchema } from '../schemas/task.schema';
import { TaskStatus } from '@repo/shared';

/** Domain representation of a task, as used across the application. */
export class Task {
  id!: number;
  title!: string;
  description!: string;
  status!: TaskStatus;
  createdAt!: string;

  static fromSchema(row: TaskSchema): Task {
    const task = new Task();
    task.id = row.id;
    task.title = row.title;
    task.description = row.description;
    task.status = Task.toStatus(row.status);
    task.createdAt = row.created_at;
    return task;
  }

  private static toStatus(value: string): TaskStatus {
    const statuses = Object.values(TaskStatus) as string[];
    if (!statuses.includes(value)) {
      throw new Error(`Invalid task status from store: "${value}"`);
    }
    return value as TaskStatus;
  }
}
