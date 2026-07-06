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

  // TODO: implement — change the task's status via the API, then refresh the list.
  changeStatus(task: TaskDto, status: TaskStatus): void {
    void task;
    void status;
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
