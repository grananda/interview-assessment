import { Provider } from '@nestjs/common';
import Database from 'better-sqlite3';

export const SQLITE_CONNECTION = Symbol('SQLITE_CONNECTION');

export type SqliteConnection = Database.Database;

export const sqliteConnectionProvider: Provider = {
  provide: SQLITE_CONNECTION,
  useFactory: (): SqliteConnection => new Database(':memory:'),
};
