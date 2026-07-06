import type { Task } from '../entities/task.entity';

/**
 * Persistence shape of a task: exactly what a SQLite row looks like. Reuses the
 * shared fields from Task via Omit and overrides only what the database stores
 * differently — the snake_case column name and a plain status string.
 */
export type TaskSchema = Omit<Task, 'status' | 'createdAt'> & {
  status: string;
  created_at: string;
};
