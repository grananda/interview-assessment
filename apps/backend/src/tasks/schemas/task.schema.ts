import type { Task } from '../entities/task.entity';

/** Persistence (SQLite row) shape of a task. */
export type TaskSchema = Omit<Task, 'status' | 'createdAt'> & {
  status: string;
  created_at: string;
};
