import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Output DTO: the shape returned to API clients. Decouples the database row
 * from the public API contract so storage changes don't leak to consumers.
 */
export class TaskResponseDto {
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
