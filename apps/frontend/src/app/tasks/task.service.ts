import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { TaskDto, TaskStatus } from '@repo/shared';

/** Talks to the tasks API. Uses a relative URL so the dev proxy forwards it. */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  /** GET /api/tasks, optionally filtered by status. */
  getTasks(status?: TaskStatus): Observable<TaskDto[]> {
    const options = status
      ? { params: new HttpParams().set('status', status) }
      : {};
    return this.http.get<TaskDto[]>(this.baseUrl, options);
  }
}
