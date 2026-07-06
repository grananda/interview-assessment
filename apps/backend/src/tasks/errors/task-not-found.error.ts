/** Domain error raised when a task does not exist. */
export class TaskNotFoundError extends Error {
  constructor(public readonly taskId: number) {
    super(`Task ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}
