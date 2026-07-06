import { Inject, Injectable } from '@nestjs/common';
import { SQLITE_CONNECTION, type SqliteConnection } from './task-database';
import { TaskSchemaInitializer } from './interfaces/task-schema-initializer';

/** SQLite implementation of TaskSchemaInitializer: creates the tasks table. */
@Injectable()
export class SqliteTaskSchemaInitializer implements TaskSchemaInitializer {
  constructor(
    @Inject(SQLITE_CONNECTION) private readonly db: SqliteConnection,
  ) {}

  createSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        -- Enforce the closed set of statuses at the persistence boundary.
        status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'done')),
        created_at TEXT NOT NULL
      )
    `);
  }
}
