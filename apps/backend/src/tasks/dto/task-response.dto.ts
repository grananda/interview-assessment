import { Task } from '../entities/task.entity';
import { TaskDto, TaskStatus } from '@repo/shared';

/**
 * Output DTO: the shape returned to API clients. Implements the shared TaskDto
 * contract so the API response is guaranteed to match what the frontend expects,
 * while decoupling the wire shape from the database row.
 */
export class TaskResponseDto implements TaskDto {
  id!: number;
  title!: string;
  description!: string;
  status!: TaskStatus;
  /** Creation date formatted as YYYY-MM-DD (date only, no time). */
  createdAt!: string;

  /** Maps a single domain Task to its API representation. */
  static fromEntity(task: Task): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = task.id;
    dto.title = task.title;
    dto.description = task.description;
    dto.status = task.status;
    dto.createdAt = task.createdAt.slice(0, 10); // ISO 8601 -> YYYY-MM-DD
    return dto;
  }

  /** Maps a list of domain Tasks to their API representations. */
  static map(tasks: readonly Task[]): TaskResponseDto[] {
    return tasks.map((task) => TaskResponseDto.fromEntity(task));
  }
}
