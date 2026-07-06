import { Component, OnInit, inject, signal } from '@angular/core';
import { TaskStatus, type TaskDto } from '@repo/shared';
import { TaskService } from '../task.service';

type StatusFilter = TaskStatus | 'all';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
  private readonly taskService = inject(TaskService);

  protected readonly tasks = signal<TaskDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusFilter = signal<StatusFilter>('all');

  protected readonly statuses: TaskStatus[] = Object.values(TaskStatus);
  protected readonly filters: StatusFilter[] = ['all', ...this.statuses];

  ngOnInit(): void {
    this.load();
  }

  protected onFilterChange(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.load();
  }

  /** Persists a task's new status, then refreshes the list on success. */
  changeStatus(task: TaskDto, status: TaskStatus): void {
    if (status === task.status) {
      return;
    }

    this.taskService.updateStatus(task.id, status).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Failed to update the task.'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    const filter = this.statusFilter();
    this.taskService.getTasks(filter === 'all' ? undefined : filter).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load tasks.');
        this.loading.set(false);
      },
    });
  }
}
