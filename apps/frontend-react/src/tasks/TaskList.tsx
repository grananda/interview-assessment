import { useCallback, useEffect, useState } from "react";
import { TaskStatus, type TaskDto } from "@repo/shared";
import { taskService } from "./task-service";

type StatusFilter = TaskStatus | "all";

const statuses: TaskStatus[] = Object.values(TaskStatus);
const filters: StatusFilter[] = ["all", ...statuses];

export function TaskList() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextTasks = await taskService.getTasks(
        statusFilter === "all" ? undefined : statusFilter,
      );
      setTasks(nextTasks);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  // TODO: implement — change the task's status via the API, then refresh the list.
  function changeStatus(task: TaskDto, status: TaskStatus): void {
    void task;
    void status;
  }

  return (
    <section className="tasks">
      <header className="tasks__header">
        <h1>Tasks</h1>
        <label className="tasks__filter">
          Status
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
          >
            {filters.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
        </label>
      </header>

      {loading ? (
        <p className="tasks__state">Loading…</p>
      ) : error ? (
        <p className="tasks__state tasks__state--error">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="tasks__state">No tasks found.</p>
      ) : (
        <ul className="tasks__list">
          {tasks.map((task) => (
            <li className="task" key={task.id}>
              <div className="task__row">
                <span className="task__title">{task.title}</span>
                <span className={`task__status task__status--${task.status}`}>
                  {task.status}
                </span>
              </div>
              <p className="task__desc">{task.description}</p>
              <time className="task__date">{task.createdAt}</time>
              {/* TODO: add a control here to change the task's status (call changeStatus). */}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
