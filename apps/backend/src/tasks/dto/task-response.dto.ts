import { Task } from '../entities/task.entity';
import { TaskDto, TaskStatus } from '@repo/shared';

/** API response shape for a task. */
export class TaskResponseDto implements TaskDto {
  id!: number;
  title!: string;
  description!: string;
  status!: TaskStatus;
  createdAt!: string;

  static fromEntity(task: Task): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = task.id;
    dto.title = task.title;
    dto.description = task.description;
    dto.status = task.status;
    dto.createdAt = task.createdAt.slice(0, 10);
    return dto;
  }

  static map(tasks: readonly Task[]): TaskResponseDto[] {
    return tasks.map((task) => TaskResponseDto.fromEntity(task));
  }
}
