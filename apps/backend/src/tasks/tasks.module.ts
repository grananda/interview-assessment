import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TASK_REPOSITORY } from './task.repository';
import { SqliteTaskRepository } from './sqlite-task.repository';

@Module({
  // In-memory cache store (default) for the tasks feature.
  imports: [CacheModule.register()],
  controllers: [TasksController],
  providers: [
    TasksService,
    // Bind the repository abstraction (token) to its SQLite implementation.
    { provide: TASK_REPOSITORY, useClass: SqliteTaskRepository },
  ],
})
export class TasksModule {}
