import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [

  {
    path: 'employee-list',
    loadComponent: () => import(`./employee-list/employee-list.component`).then(c => c.EmployeeListComponent),
    title: 'Manage Employee',
    data: { breadcrumb: 'Manage Employee' },
    canActivate: [ProtectedGuard]
  },
  {
    path: 'employee/:action',
    loadComponent: () => import(`./add-edit-module/add-edit-module.component`).then(c => c.AddEditModuleComponent),
    title: 'Add Employee',
    canActivate: [ProtectedGuard]
  },
  {
    path: 'work-history/:action',
    loadComponent: () => import(`./components/work-history/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    title: 'Add Employee',
    data: { breadcrumb: 'Work History' },
    canActivate: [ProtectedGuard]
  },
  {
    path: 'education-history/:action',
    loadComponent: () => import(`./components/education/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    title: 'Add Employee',
    data: { breadcrumb: 'Education History' },
    canActivate: [ProtectedGuard]
  },
  {
    path: 'department-team/:action',
    loadComponent: () => import(`./components/department-team/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    title: 'Add Department & Team',
    data: { breadcrumb: 'Department & Team' },
    canActivate: [ProtectedGuard]
  },
  {
    path: 'shift-history/:action',
    loadComponent: () => import(`./components/education/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    title: 'Add Shift',
    data: { breadcrumb: 'Shift' },
    canActivate: [ProtectedGuard]
  },
  {
    path: 'shift-history/:action',
    loadComponent: () => import(`./components/department-team/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    title: 'Add Shift',
    data: { breadcrumb: 'Shift' },
    canActivate: [ProtectedGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
