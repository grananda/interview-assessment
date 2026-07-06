import { TaskResponseDto } from './task-response.dto';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';

describe('TaskResponseDto', () => {
  const buildTask = (): Task => {
    const task = new Task();
    task.id = 1;
    task.title = 'Wire the tasks endpoint';
    task.description = 'Return the task list from the service';
    task.status = TaskStatus.InProgress;
    task.createdAt = '2026-02-01T12:30:00.000Z';
    return task;
  };

  it('formats createdAt as a date only (YYYY-MM-DD), dropping the time', () => {
    const dto = TaskResponseDto.fromEntity(buildTask());

    expect(dto.createdAt).toBe('2026-02-01');
    expect(dto.status).toBe(TaskStatus.InProgress);
    expect(dto.id).toBe(1);
  });

  it('maps a list preserving order and formatting each date', () => {
    const dtos = TaskResponseDto.map([buildTask(), buildTask()]);

    expect(dtos).toHaveLength(2);
    expect(dtos.every((d) => d.createdAt === '2026-02-01')).toBe(true);
  });
});
