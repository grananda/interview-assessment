import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { TaskDto, TaskStatus } from '@repo/shared';

/** Tasks API client. */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  getTasks(status?: TaskStatus): Observable<TaskDto[]> {
    const options = status
      ? { params: new HttpParams().set('status', status) }
      : {};
    return this.http.get<TaskDto[]>(this.baseUrl, options);
  }
}
