import { TaskSchema } from '../../schemas/task.schema';
import { TaskStatus } from '@repo/shared';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface TaskRepository {
  findAll(status?: TaskStatus): Promise<TaskSchema[]>;
  findById(id: number): Promise<TaskSchema | null>;
  updateStatus(id: number, status: TaskStatus): Promise<TaskSchema | null>;
}
