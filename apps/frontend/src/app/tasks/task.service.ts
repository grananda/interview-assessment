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

  updateStatus(id: number, status: TaskStatus): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.baseUrl}/${id}/status`, { status });
  }
}
