import { TaskSchema } from '../../schemas/task.schema';
import { TaskStatus } from '../../enums/task-status.enum';

/** Injection token for the task repository abstraction. */
export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

/**
 * Persistence contract for tasks. Returns raw persistence rows (TaskSchema);
 * turning them into domain entities is the service's responsibility.
 */
export interface TaskRepository {
  findAll(status?: TaskStatus): Promise<TaskSchema[]>;
  findById(id: number): Promise<TaskSchema | null>;
}
