import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';
import { sqliteConnectionProvider } from './database/task-database';
import {
  TASK_SCHEMA_INITIALIZER,
  type TaskSchemaInitializer,
} from './database/interfaces/task-schema-initializer';
import { SqliteTaskSchemaInitializer } from './database/sqlite-task-schema-initializer';
import {
  TASK_SEEDER,
  type TaskSeeder,
} from './database/interfaces/task-seeder';
import { SqliteTaskSeeder } from './database/sqlite-task-seeder';
import { TASK_REPOSITORY } from './repositories/interfaces/task.repository';
import { SqliteTaskRepository } from './repositories/sqlite-task.repository';

@Module({
  // In-memory cache store (default) for the tasks feature.
  imports: [CacheModule.register()],
  controllers: [TasksController],
  providers: [
    // Shared SQLite connection, created once and injected everywhere.
    sqliteConnectionProvider,
    // Schema and seeder abstractions bound to their SQLite implementations.
    {
      provide: TASK_SCHEMA_INITIALIZER,
      useClass: SqliteTaskSchemaInitializer,
    },
    { provide: TASK_SEEDER, useClass: SqliteTaskSeeder },
    TasksService,
    // Bind the repository abstraction (token) to its SQLite implementation.
    { provide: TASK_REPOSITORY, useClass: SqliteTaskRepository },
  ],
})
export class TasksModule implements OnModuleInit {
  constructor(
    @Inject(TASK_SCHEMA_INITIALIZER)
    private readonly schemaInitializer: TaskSchemaInitializer,
    @Inject(TASK_SEEDER) private readonly seeder: TaskSeeder,
  ) {}

  /** Bootstrap order matters: the table must exist before seeding it. */
  onModuleInit(): void {
    this.schemaInitializer.createSchema();
    this.seeder.seed();
  }
}
