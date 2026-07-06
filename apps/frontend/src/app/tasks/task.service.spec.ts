import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { TaskStatus, type TaskDto } from '@repo/shared';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const task: TaskDto = {
    id: 1,
    title: 'Wire the tasks endpoint',
    description: 'Return the task list from the service',
    status: TaskStatus.InProgress,
    createdAt: '2026-02-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests GET /api/tasks without params by default', () => {
    service.getTasks().subscribe((tasks) => expect(tasks).toEqual([task]));

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('status')).toBe(false);
    req.flush([task]);
  });

  it('adds the status query param when filtering', () => {
    service.getTasks(TaskStatus.Done).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/tasks' && r.params.get('status') === 'done',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
