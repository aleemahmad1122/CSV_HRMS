import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: 'report',
    loadComponent: () => import(`./reports/list/list.component`).then(c => c.ListComponent),
    title: 'Report',
    canActivate: [ProtectedGuard]
  },
  {
    path: 'report/:action',
    loadComponent: () => import(`./reports/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    title: 'Add Report',
    canActivate: [ProtectedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminReportRoutingModule { }
