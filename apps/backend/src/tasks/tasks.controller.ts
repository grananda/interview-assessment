import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskResponseDto } from './dto/task-response.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** GET /api/tasks?status=... — returns the (optionally filtered) task list. */
  @Get()
  findAll(@Query() query: QueryTasksDto): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(query);
  }

  /** GET /api/tasks/:id — returns a single task or 404 when not found. */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    return this.tasksService.findById(id);
  }
}
