/**
 * Domain error raised when a task does not exist. Transport-agnostic: it knows
 * nothing about HTTP, so the same service works under any delivery mechanism.
 * The boundary (controller/filter) is responsible for translating it.
 */
export class TaskNotFoundError extends Error {
  constructor(public readonly taskId: number) {
    super(`Task ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}
