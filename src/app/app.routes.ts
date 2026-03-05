import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'app/cases/:id',
    loadComponent: () =>
      import('./features/cases/presentation/pages/case-detail/case-detail.page').then((m) => m.CaseDetailPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
