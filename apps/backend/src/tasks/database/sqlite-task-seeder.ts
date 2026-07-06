import { Inject, Injectable } from '@nestjs/common';
import { SQLITE_CONNECTION, type SqliteConnection } from './task-database';
import { TaskSeeder } from './interfaces/task-seeder';
import { TaskStatus } from '@repo/shared';

/** SQLite implementation of TaskSeeder: inserts demo tasks if none exist. */
@Injectable()
export class SqliteTaskSeeder implements TaskSeeder {
  constructor(
    @Inject(SQLITE_CONNECTION) private readonly db: SqliteConnection,
  ) {}

  seed(): void {
    const { n } = this.db.prepare('SELECT COUNT(*) AS n FROM tasks').get() as {
      n: number;
    };
    if (n > 0) return;

    const insert = this.db.prepare(
      'INSERT INTO tasks (title, description, status, created_at) VALUES (?, ?, ?, ?)',
    );
    insert.run(
      'Set up the monorepo',
      'Bootstrap Turborepo with Angular and Nest',
      TaskStatus.Done,
      '2026-01-10T09:00:00.000Z',
    );
    insert.run(
      'Wire the tasks endpoint',
      'Return the task list from the service',
      TaskStatus.InProgress,
      '2026-02-01T12:30:00.000Z',
    );
    insert.run(
      'Cover the service with tests',
      'Mock the repository and the cache',
      TaskStatus.Pending,
      '2026-03-15T08:15:00.000Z',
    );
  }
}
