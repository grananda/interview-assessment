import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, type Mock } from 'vitest';
import { TaskList } from './task-list';
import { TaskService } from '../task.service';
import { TaskStatus, type TaskDto } from '@repo/shared';

describe('TaskList', () => {
  const tasks: TaskDto[] = [
    {
      id: 1,
      title: 'Set up the monorepo',
      description: 'Bootstrap Turborepo',
      status: TaskStatus.Done,
      createdAt: '2026-01-10',
    },
    {
      id: 2,
      title: 'Wire the tasks endpoint',
      description: 'Return the list',
      status: TaskStatus.InProgress,
      createdAt: '2026-02-01',
    },
  ];

  const setup = (
    getTasks: Mock,
    updateStatus: Mock = vi.fn().mockReturnValue(of(tasks[0])),
  ) => {
    TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [{ provide: TaskService, useValue: { getTasks, updateStatus } }],
    });
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges(); // triggers ngOnInit + render
    return fixture;
  };

  it('renders the task list returned by the service', () => {
    const getTasks = vi.fn().mockReturnValue(of(tasks));
    const fixture = setup(getTasks);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(getTasks).toHaveBeenCalledWith(undefined);
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.task').length,
    ).toBe(2);
    expect(text).toContain('Set up the monorepo');
    expect(text).toContain('Wire the tasks endpoint');
  });

  it('shows the empty state when there are no tasks', () => {
    const fixture = setup(vi.fn().mockReturnValue(of([])));

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No tasks found.',
    );
  });

  it('shows an error message when the request fails', () => {
    const fixture = setup(
      vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    );

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Failed to load tasks.',
    );
  });

  it('re-queries with the selected status when the filter changes', () => {
    const getTasks = vi.fn().mockReturnValue(of(tasks));
    const fixture = setup(getTasks);

    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    select.value = 'done';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(getTasks).toHaveBeenLastCalledWith('done');
  });

  // TODO (candidate): make this pass by implementing changeStatus.
  describe('changeStatus', () => {
    it('updates the status via the service and reloads the list', () => {
      const getTasks = vi.fn().mockReturnValue(of(tasks));
      const updateStatus = vi.fn().mockReturnValue(of(tasks[0]));
      const fixture = setup(getTasks, updateStatus);

      fixture.componentInstance.changeStatus(tasks[0], TaskStatus.Pending);

      expect(updateStatus).toHaveBeenCalledWith(1, TaskStatus.Pending);
      // initial load on init + reload after the update
      expect(getTasks).toHaveBeenCalledTimes(2);
    });
  });
});
