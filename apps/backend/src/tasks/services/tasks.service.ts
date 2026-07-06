import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repositories/interfaces/task.repository';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '@repo/shared';
import { TaskNotFoundError } from '../errors/task-not-found.error';

@Injectable()
export class TasksService {
  /** Time-to-live for cached task lists, in milliseconds. */
  private readonly cacheTtlMs = 30_000;

  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /** Returns the task list, optionally filtered by status. */
  async findAll(status?: TaskStatus): Promise<readonly Task[]> {
    const cacheKey = `tasks:${status ?? 'all'}`;

    const cached = await this.cache.get<Task[]>(cacheKey);
    if (cached) {
      return [...cached];
    }

    const rows = await this.taskRepository.findAll(status);
    const tasks = rows.map((row) => Task.fromSchema(row));

    await this.cache.set(cacheKey, tasks, this.cacheTtlMs);
    return [...tasks];
  }

  /** Returns a single task or raises a domain error when it does not exist. */
  async findById(id: number): Promise<Task> {
    const cacheKey = `task:${id}`;

    const cached = await this.cache.get<Task>(cacheKey);
    if (cached) {
      return cached;
    }

    const row = await this.taskRepository.findById(id);
    if (!row) {
      throw new TaskNotFoundError(id);
    }

    const task = Task.fromSchema(row);
    await this.cache.set(cacheKey, task, this.cacheTtlMs);
    return task;
  }

  /** Updates a task's status or raises a domain error when it does not exist. */
  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const row = await this.taskRepository.updateStatus(id, status);
    if (!row) {
      throw new TaskNotFoundError(id);
    }

    const task = Task.fromSchema(row);
    await this.invalidateListCaches();
    await this.cache.set(`task:${id}`, task, this.cacheTtlMs);
    return task;
  }

  private async invalidateListCaches(): Promise<void> {
    await this.cache.del('tasks:all');
    await Promise.all(
      Object.values(TaskStatus).map((status) =>
        this.cache.del(`tasks:${status}`),
      ),
    );
  }
}
