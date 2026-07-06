/** Injection token for the tasks schema initializer. */
export const TASK_SCHEMA_INITIALIZER = Symbol('TASK_SCHEMA_INITIALIZER');

/** Creates the persistence structure (tables/indexes) for tasks. */
export interface TaskSchemaInitializer {
  createSchema(): void;
}
