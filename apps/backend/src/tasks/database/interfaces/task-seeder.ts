/** Injection token for the tasks seeder. */
export const TASK_SEEDER = Symbol('TASK_SEEDER');

/** Inserts the initial demo data for tasks (assumes the schema exists). */
export interface TaskSeeder {
  seed(): void;
}
