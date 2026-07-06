import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TasksService } from './tasks.service';
import {
  TASK_REPOSITORY,
  TaskRepository,
} from '../repositories/interfaces/task.repository';
import { TaskStatus } from '@repo/shared';
import { Task } from '../entities/task.entity';
import { TaskSchema } from '../schemas/task.schema';
import { TaskNotFoundError } from '../errors/task-not-found.error';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TaskRepository>;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  // Raw persistence row as returned by the repository (snake_case, plain status).
  const row: TaskSchema = {
    id: 1,
    title: 'Wire the tasks endpoint',
    description: 'Return the task list from the service',
    status: 'in_progress',
    created_at: '2026-02-01T12:30:00.000Z',
  };
  // Expected domain shape as a real Task instance, spelled out explicitly: the
  // values are hand-written (so the mapping is verified independently of
  // Task.fromSchema) while the prototype lets toStrictEqual assert the instance.
  const buildExpectedTask = (): Task => {
    const task = new Task();
    task.id = 1;
    task.title = 'Wire the tasks endpoint';
    task.description = 'Return the task list from the service';
    task.status = TaskStatus.InProgress;
    task.createdAt = '2026-02-01T12:30:00.000Z';
    return task;
  };
  const expectedTask = buildExpectedTask();

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

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
    expect(result).toStrictEqual([expectedTask]);
    // Key, mapped value and TTL (30s) must all be persisted back.
    expect(cache.set).toHaveBeenCalledWith('tasks:all', [expectedTask], 30_000);
  });

  it('returns a fresh array so the cached state cannot be mutated by callers', async () => {
    const cachedTasks = [buildExpectedTask()];
    cache.get.mockResolvedValue(cachedTasks);

    const result = await service.findAll();

    expect(result).not.toBe(cachedTasks); // different array reference
    expect(result).toStrictEqual(cachedTasks);
  });

  it('serves from cache without hitting the repository on a cache hit', async () => {
    cache.get.mockResolvedValue([expectedTask]);

    const result = await service.findAll();

    expect(result).toStrictEqual([expectedTask]);
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

  it('returns the mapped task and caches it by id when it exists', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(row);

    const result = await service.findById(1);

    expect(cache.get).toHaveBeenCalledWith('task:1');
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(result).toStrictEqual(expectedTask);
    expect(cache.set).toHaveBeenCalledWith('task:1', expectedTask, 30_000);
  });

  it('serves a single task from cache without hitting the repository', async () => {
    cache.get.mockResolvedValue(expectedTask);

    const result = await service.findById(1);

    expect(result).toStrictEqual(expectedTask);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('raises a domain error when the task does not exist', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('updates the status, invalidates list caches and refreshes the task', async () => {
    repository.updateStatus.mockResolvedValue(row);

    const result = await service.updateStatus(1, TaskStatus.Done);

    expect(repository.updateStatus).toHaveBeenCalledWith(1, TaskStatus.Done);
    expect(result).toStrictEqual(expectedTask);
    // Every cached list is dropped (unfiltered + one per status)...
    expect(cache.del).toHaveBeenCalledWith('tasks:all');
    expect(cache.del).toHaveBeenCalledWith('tasks:done');
    expect(cache.del).toHaveBeenCalledWith('tasks:pending');
    expect(cache.del).toHaveBeenCalledWith('tasks:in_progress');
    // ...and the single-task entry is refreshed with the new value.
    expect(cache.set).toHaveBeenCalledWith('task:1', expectedTask, 30_000);
  });

  it('raises a domain error and touches no cache when updating a missing task', async () => {
    repository.updateStatus.mockResolvedValue(null);

    await expect(service.updateStatus(99, TaskStatus.Done)).rejects.toBeInstanceOf(
      TaskNotFoundError,
    );
    expect(cache.del).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });
});
