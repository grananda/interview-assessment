import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { QueryTasksDto } from '../dto/query-tasks.dto';
import { TaskResponseDto } from '../dto/task-response.dto';
import { TaskNotFoundError } from '../errors/task-not-found.error';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** GET /api/tasks?status=... — returns the (optionally filtered) task list. */
  @Get()
  async findAll(@Query() query: QueryTasksDto): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksService.findAll(query.status);
    return TaskResponseDto.map(tasks);
  }

  /** GET /api/tasks/:id — returns a single task or 404 when not found. */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskResponseDto> {
    try {
      const task = await this.tasksService.findById(id);
      return TaskResponseDto.fromEntity(task);
    } catch (error) {
      // Translate the transport-agnostic domain error into an HTTP response.
      if (error instanceof TaskNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
