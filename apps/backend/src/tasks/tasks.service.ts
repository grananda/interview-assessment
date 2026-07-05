import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { TASK_REPOSITORY, type TaskRepository } from './task.repository';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskResponseDto } from './dto/task-response.dto';

@Injectable()
export class TasksService {
  /** Time-to-live for cached task lists, in milliseconds. */
  private readonly cacheTtlMs = 30_000;

  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Returns the task list (optionally filtered by status), served from the
   * in-memory cache on a hit and persisted back on a miss.
   */
  async findAll(query: QueryTasksDto): Promise<TaskResponseDto[]> {
    const cacheKey = `tasks:${query.status ?? 'all'}`;

    const cached = await this.cache.get<TaskResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const tasks = await this.taskRepository.findAll(query.status);
    const response = TaskResponseDto.map(tasks);

    await this.cache.set(cacheKey, response, this.cacheTtlMs);
    return response;
  }

  /** Returns a single task or throws 404 when it does not exist. */
  async findById(id: number): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return TaskResponseDto.fromEntity(task);
  }
}
