import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskStatus, type TaskDto } from "@repo/shared";
import { taskService } from "./task-service";

describe("taskService", () => {
  const task: TaskDto = {
    id: 1,
    title: "Wire the tasks endpoint",
    description: "Return the task list from the service",
    status: TaskStatus.InProgress,
    createdAt: "2026-02-01",
  };

  afterEach(() => vi.unstubAllGlobals());

  function mockFetch(body: unknown) {
    return vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(body),
    });
  }

  it("requests GET /api/tasks without params by default", async () => {
    const fetchMock = mockFetch([task]);
    vi.stubGlobal("fetch", fetchMock);

    await expect(taskService.getTasks()).resolves.toEqual([task]);
    expect(fetchMock).toHaveBeenCalledWith("/api/tasks", undefined);
  });

  it("adds the status query param when filtering", async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal("fetch", fetchMock);

    await taskService.getTasks(TaskStatus.Done);

    expect(fetchMock).toHaveBeenCalledWith("/api/tasks?status=done", undefined);
  });

  it("PUTs the new status to /api/tasks/:id/status", async () => {
    const fetchMock = mockFetch({ ...task, status: TaskStatus.Done });
    vi.stubGlobal("fetch", fetchMock);

    await taskService.updateStatus(1, TaskStatus.Done);

    expect(fetchMock).toHaveBeenCalledWith("/api/tasks/1/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: TaskStatus.Done }),
    });
  });

  it("rejects unsuccessful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(taskService.getTasks()).rejects.toThrow(
      "Request failed with status 500",
    );
  });
});
