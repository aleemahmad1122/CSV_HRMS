import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'employee',
    loadComponent: () => import(`./components/employee/employee.component`).then(c => c.EmployeeComponent),
    data: { breadcrumb: 'Attendances Employee' },
    title: 'Attendances Employee List',
  },
  {
    path: 'attendance-list',
    loadComponent: () => import(`./list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Manage Attendances' },
    title: 'Attendances List',
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
    data: { breadcrumb: 'Attendances Import' },
    title: 'Attendances',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
