import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TasksService } from './tasks.service';
import {
  TASK_REPOSITORY,
  TaskRepository,
} from '../repositories/interfaces/task.repository';
import { TaskStatus } from '../enums/task-status.enum';
import type { Task } from '../entities/task.entity';
import { TaskSchema } from '../schemas/task.schema';
import { TaskNotFoundError } from '../errors/task-not-found.error';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TaskRepository>;
  let cache: { get: jest.Mock; set: jest.Mock };

  // Raw persistence row as returned by the repository (snake_case, plain status).
  const row: TaskSchema = {
    id: 1,
    title: 'Wire the tasks endpoint',
    description: 'Return the task list from the service',
    status: 'in_progress',
    created_at: '2026-02-01T12:30:00.000Z',
  };
  // Expected domain shape, spelled out explicitly so the mapping (snake_case ->
  // camelCase, string -> enum) is verified independently of Task.fromSchema.
  const expectedTask: Task = {
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

  it('maps rows to domain tasks and caches them under the right key on a miss', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findAll.mockResolvedValue([row]);

    const result = await service.findAll();

    expect(cache.get).toHaveBeenCalledWith('tasks:all');
    expect(repository.findAll).toHaveBeenCalledWith(undefined);
    expect(result).toEqual([expectedTask]);
    // Key, mapped value and TTL (30s) must all be persisted back.
    expect(cache.set).toHaveBeenCalledWith('tasks:all', [expectedTask], 30_000);
  });

  it('serves from cache without hitting the repository on a cache hit', async () => {
    cache.get.mockResolvedValue([expectedTask]);

    const result = await service.findAll();

    expect(result).toEqual([expectedTask]);
    expect(repository.findAll).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('forwards the status filter to the repository and namespaces the cache key', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findAll.mockResolvedValue([]);

    await service.findAll(TaskStatus.Done);

    expect(cache.get).toHaveBeenCalledWith('tasks:done');
    expect(repository.findAll).toHaveBeenCalledWith(TaskStatus.Done);
  });

  it('returns the mapped task when it exists', async () => {
    repository.findById.mockResolvedValue(row);

    const result = await service.findById(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedTask);
  });

  it('raises a domain error when the task does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
  });
});
