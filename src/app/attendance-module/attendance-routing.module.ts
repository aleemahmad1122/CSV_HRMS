import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'employee',
    loadComponent: () => import(`./components/employee/employee.component`).then(c => c.EmployeeComponent),
    data: { breadcrumb: 'Attendances List' },
    title: 'Attendances Employee List',
  },
  {
    path: 'attendance-list',
    loadComponent: () => import(`./list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Attendances List' },
    title: 'Attendances List',
  },
  {
    path: 'leave/:action',
    loadComponent: () => import(`./components/leave/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Leave Detail' },
    title: 'Leave',
  },
  {
    path: 'leave-list',
    loadComponent: () => import(`./components/leave/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Leave List' },
    title: 'Leave List',
  },
  {
    path: 'attendance/:action',
    loadComponent: () => import(`./add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Attendances Detail' },
    title: 'Attendances',
  },
  {
    path: 'import',
    loadComponent: () => import(`./components/import/import.component`).then(c => c.ImportComponent),
    data: { breadcrumb: 'Attendances Detail' },
    title: 'Attendances',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
