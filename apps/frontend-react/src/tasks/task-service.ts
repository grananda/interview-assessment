import type { TaskDto, TaskStatus } from "@repo/shared";

const baseUrl = "/api/tasks";

async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Tasks API client. */
export const taskService = {
  getTasks(status?: TaskStatus): Promise<TaskDto[]> {
    const query = status
      ? `?${new URLSearchParams({ status }).toString()}`
      : "";

    return request<TaskDto[]>(`${baseUrl}${query}`);
  },

  updateStatus(id: number, status: TaskStatus): Promise<TaskDto> {
    return request<TaskDto>(`${baseUrl}/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
};
