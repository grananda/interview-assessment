import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';

/** Injection token for the task repository abstraction. */
export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

/**
 * Persistence contract for tasks. The service depends on this interface, not
 * on a concrete database, so the storage engine can be swapped freely.
 */
export interface TaskRepository {
  findAll(status?: TaskStatus): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
}
