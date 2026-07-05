import { Injectable, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import { TaskRepository } from './task.repository';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';

/** Raw row as stored in SQLite (snake_case columns). */
interface TaskRow {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

/** SQLite-backed implementation of TaskRepository using better-sqlite3. */
@Injectable()
export class SqliteTaskRepository implements TaskRepository, OnModuleInit {
  // In-memory database keeps the assessment self-contained (no file on disk).
  private readonly db = new Database(':memory:');

  onModuleInit(): void {
    this.createSchema();
    this.seed();
  }

  async findAll(status?: TaskStatus): Promise<Task[]> {
    const rows = status
      ? this.db
          .prepare('SELECT * FROM tasks WHERE status = ? ORDER BY id')
          .all(status)
      : this.db.prepare('SELECT * FROM tasks ORDER BY id').all();
    return (rows as TaskRow[]).map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<Task | null> {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      | TaskRow
      | undefined;
    return row ? this.toEntity(row) : null;
  }

  private createSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }

  private seed(): void {
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

  /** Maps a raw DB row (snake_case) to the domain entity (camelCase). */
  private toEntity(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      createdAt: row.created_at,
    };
  }
}
