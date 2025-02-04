import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from '../shared/resolvers/permission.service';

const routes: Routes = [
  {
    path: 'attendance',
    loadComponent: () => import(`./list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Manage Attendances',permission:"View_Attendance,Apply_Attendance,Edit_Attendance,Attendance_Approval,HR_Approval" },
    title: 'Attendances List',
    resolve: { permission: PermissionService },
  },
  {
    path: 'remote',
    loadComponent: () => import(`./components/remote/remote.component`).then(c => c.RemoteComponent),
    data: { breadcrumb: 'Manage Attendances',permission:"View_Remote_Attendance,Apply_Attendance,Edit_Attendance,Attendance_Approval,HR_Approval" },
    title: 'Attendances Remote',
    resolve: { permission: PermissionService },
  },
  {
    path: 'request',
    loadComponent: () => import(`./components/request/request.component`).then(c => c.RequestComponent),
    data: { breadcrumb: 'Manage Attendances',permission:"View_Missing_Attendance,Apply_Attendance,Edit_Attendance,Attendance_Approval,HR_Approval" },
    title: 'Attendances Request',
    resolve: { permission: PermissionService },
  },
  {
    path: 'attendance/:action',
    loadComponent: () => import(`./add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Attendances Detail',permission:"Apply_Attendance,Edit_Attendance" },
    title: 'Attendances',
    resolve: { permission: PermissionService },
  },
  {
    path: 'import',
    loadComponent: () => import(`./components/import/import.component`).then(c => c.ImportComponent),
    data: { breadcrumb: 'Attendances Import',permission:"Import_Attendance" },
    title: 'Attendances',
    resolve: { permission: PermissionService },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
