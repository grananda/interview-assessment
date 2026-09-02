import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("../tasks/TaskList", () => ({
  TaskList: () => <div>Task list</div>,
}));

describe("App", () => {
  it("renders the task list", () => {
    const { getByText } = render(<App />);

    expect(getByText("Task list")).toBeInTheDocument();
  });
});
