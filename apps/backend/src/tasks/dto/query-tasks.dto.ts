import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '@repo/shared';

/** Query parameters for GET /api/tasks. */
export class QueryTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
