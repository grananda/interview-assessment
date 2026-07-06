import { Provider } from '@nestjs/common';
import Database from 'better-sqlite3';

/** Injection token for the shared SQLite connection. */
export const SQLITE_CONNECTION = Symbol('SQLITE_CONNECTION');

/** Instance type of a better-sqlite3 connection. */
export type SqliteConnection = Database.Database;

/**
 * Provides a single in-memory SQLite connection shared across the module.
 * A shared instance is mandatory: every ':memory:' connection is an isolated
 * database, so schema/seed and queries must run on the very same one.
 */
export const sqliteConnectionProvider: Provider = {
  provide: SQLITE_CONNECTION,
  useFactory: (): SqliteConnection => new Database(':memory:'),
};
