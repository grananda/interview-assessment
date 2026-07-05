import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TasksService } from './tasks.service';
import { TASK_REPOSITORY, TaskRepository } from './task.repository';
import { TaskStatus } from './enums/task-status.enum';
import { Task } from './entities/task.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TaskRepository>;
  let cache: { get: jest.Mock; set: jest.Mock };

  const task: Task = {
    id: 1,
    title: 'Wire the tasks endpoint',
    description: 'Return the task list from the service',
    status: TaskStatus.InProgress,
    createdAt: '2026-02-01T12:30:00.000Z',
  };

  beforeEach(async () => {
    repository = { findAll: jest.fn(), findById: jest.fn() };
    cache = { get: jest.fn(), set: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TASK_REPOSITORY, useValue: repository },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
  });

  it('maps tasks from the repository and formats the date on a cache miss', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findAll.mockResolvedValue([task]);

    const result = await service.findAll({});

    expect(repository.findAll).toHaveBeenCalledWith(undefined);
    expect(result).toEqual([
      expect.objectContaining({ id: 1, createdAt: '2026-02-01' }),
    ]);
    expect(cache.set).toHaveBeenCalled();
  });

  it('serves from cache without hitting the repository on a cache hit', async () => {
    cache.get.mockResolvedValue([{ id: 1 }]);

    const result = await service.findAll({});

    expect(result).toEqual([{ id: 1 }]);
    expect(repository.findAll).not.toHaveBeenCalled();
  });

  it('forwards the status filter to the repository', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findAll.mockResolvedValue([]);

    await service.findAll({ status: TaskStatus.Done });

    expect(repository.findAll).toHaveBeenCalledWith(TaskStatus.Done);
  });

  it('throws 404 when the task does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toThrow('Task 99 not found');
  });
});
