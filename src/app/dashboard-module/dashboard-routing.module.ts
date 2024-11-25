import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import(`./dashboard/dashboard.component`).then(c => c.DashboardComponent),
    title: 'Dashboard',
   // canActivate: [ProtectedGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
