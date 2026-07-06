import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () =>
      import('./tasks/task-list/task-list').then((m) => m.TaskList),
  },
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
];
