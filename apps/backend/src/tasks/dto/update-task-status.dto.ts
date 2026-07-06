import { IsEnum } from 'class-validator';
import { TaskStatus } from '@repo/shared';

/** Request body for PUT /api/tasks/:id/status. */
export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
