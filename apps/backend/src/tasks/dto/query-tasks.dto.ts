import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

/** Input DTO: query parameters accepted by GET /api/tasks. */
export class QueryTasksDto {
  /** Optional status filter. Must be a valid TaskStatus when present. */
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
