import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskStatus, type TaskDto } from "@repo/shared";
import { TaskList } from "./TaskList";
import { taskService } from "./task-service";

vi.mock("./task-service", () => ({
  taskService: {
    getTasks: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

describe("TaskList", () => {
  const tasks: TaskDto[] = [
    {
      id: 1,
      title: "Set up the monorepo",
      description: "Bootstrap Turborepo",
      status: TaskStatus.Done,
      createdAt: "2026-01-10",
    },
    {
      id: 2,
      title: "Wire the tasks endpoint",
      description: "Return the list",
      status: TaskStatus.InProgress,
      createdAt: "2026-02-01",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(taskService.getTasks).mockResolvedValue(tasks);
    vi.mocked(taskService.updateStatus).mockResolvedValue(tasks[0]);
  });

  it("renders the task list returned by the service", async () => {
    render(<TaskList />);

    expect(await screen.findByText("Set up the monorepo")).toBeInTheDocument();
    expect(screen.getByText("Wire the tasks endpoint")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(taskService.getTasks).toHaveBeenCalledWith(undefined);
  });

  it("shows the empty state when there are no tasks", async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([]);

    render(<TaskList />);

    expect(await screen.findByText("No tasks found.")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    vi.mocked(taskService.getTasks).mockRejectedValue(new Error("boom"));

    render(<TaskList />);

    expect(
      await screen.findByText("Failed to load tasks."),
    ).toBeInTheDocument();
  });

  it("re-queries with the selected status when the filter changes", async () => {
    render(<TaskList />);
    await screen.findByText("Set up the monorepo");

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: TaskStatus.Done },
    });

    await waitFor(() =>
      expect(taskService.getTasks).toHaveBeenLastCalledWith(TaskStatus.Done),
    );
  });

  // TODO (candidate): make this pass by implementing the status control and changeStatus.
  describe("changeStatus", () => {
    it("updates the status via the service and reloads the list", async () => {
      render(<TaskList />);
      const taskItem = (await screen.findByText(tasks[0].title)).closest("li")!;

      fireEvent.change(
        within(taskItem).getByRole("combobox", {
          name: `Change status for ${tasks[0].title}`,
        }),
        { target: { value: TaskStatus.Pending } },
      );

      expect(taskService.updateStatus).toHaveBeenCalledWith(
        1,
        TaskStatus.Pending,
      );
      await waitFor(() =>
        expect(taskService.getTasks).toHaveBeenCalledTimes(2),
      );
    });

    it("does not update when the selected status has not changed", async () => {
      render(<TaskList />);
      const taskItem = (await screen.findByText(tasks[0].title)).closest("li")!;

      fireEvent.change(
        within(taskItem).getByRole("combobox", {
          name: `Change status for ${tasks[0].title}`,
        }),
        { target: { value: TaskStatus.Done } },
      );

      expect(taskService.updateStatus).not.toHaveBeenCalled();
    });

    it("shows an error when updating the status fails", async () => {
      vi.mocked(taskService.updateStatus).mockRejectedValue(new Error("boom"));
      render(<TaskList />);
      const taskItem = (await screen.findByText(tasks[0].title)).closest("li")!;

      fireEvent.change(
        within(taskItem).getByRole("combobox", {
          name: `Change status for ${tasks[0].title}`,
        }),
        { target: { value: TaskStatus.Pending } },
      );

      expect(
        await screen.findByText("Failed to update the task."),
      ).toBeInTheDocument();
      expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    });
  });
});
