import { Inject, Injectable } from '@nestjs/common';
import {
  SQLITE_CONNECTION,
  type SqliteConnection,
} from '../database/task-database';
import { TaskRepository } from './interfaces/task.repository';
import { TaskSchema } from '../schemas/task.schema';
import { TaskStatus } from '../enums/task-status.enum';

/** SQLite-backed implementation of TaskRepository. Only reads raw rows. */
@Injectable()
export class SqliteTaskRepository implements TaskRepository {
  constructor(
    @Inject(SQLITE_CONNECTION) private readonly db: SqliteConnection,
  ) {}

  async findAll(status?: TaskStatus): Promise<TaskSchema[]> {
    const rows = status
      ? this.db
          .prepare('SELECT * FROM tasks WHERE status = ? ORDER BY id')
          .all(status)
      : this.db.prepare('SELECT * FROM tasks ORDER BY id').all();
    return rows as TaskSchema[];
  }

  async findById(id: number): Promise<TaskSchema | null> {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      TaskSchema | undefined;
    return row ?? null;
  }
}
