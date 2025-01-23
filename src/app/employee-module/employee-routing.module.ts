import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';
import { PermissionService } from '../shared/resolvers/permission.service';

const routes: Routes = [
  {
    path: 'employee-list',
    loadComponent: () => import(`./employee-list/employee-list.component`).then(c => c.EmployeeListComponent),
    title: 'Manage Employee',
    data: { breadcrumb: 'Manage Employee', permission: "HR_Approval,Create_Employee,Edit_Employee,View_Employee,Delete_Employee" },
    resolve: { permission: PermissionService },
    canActivate: [ProtectedGuard]
  },
  {
    path: 'import',
    loadComponent: () => import(`./components/import/import.component`).then(c => c.ImportComponent),
    title: 'Import Employees',
    data: { breadcrumb: 'Import Employees', permission: "Import_Employees" },
    resolve: { permission: PermissionService },
    canActivate: [ProtectedGuard]
  },
  {
    path: "profile",
    loadComponent: () => import(`./components/sidebar/sidebar.component`).then(c => c.SidebarComponent),
    data: { breadcrumb: 'Profile' },
    children: [
      {
        path: 'employee/:action',
        loadComponent: () => import(`./add-edit-module/add-edit-module.component`).then(c => c.AddEditModuleComponent),

        data: { breadcrumb: '', permission: "Create_Employee,Edit_Employee,View_Personal_Info" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'assets',
        loadComponent: () => import(`./components/asset/list/list.component`).then(c => c.ListComponent),
        data: { breadcrumb: 'Assets', permission: "View_Employee_Asset,Create_Employee_Asset,Edit_Employee_Asset,Delete_Employee_Asset"  },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'assets/:action',
        loadComponent: () => import(`./components/asset/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        data: { breadcrumb: 'Asset', permission: "View_Employee_Asset,Create_Employee_Asset,Edit_Employee_Asset,Delete_Employee_Asset"  },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'work-history',
        loadComponent: () => import(`./components/work-history/work-history.component`).then(c => c.WorkHistoryComponent),

        data: { breadcrumb: 'Work History', permission: "Create_Employee_Work_History,Edit_Employee_Work_History,Delete_Employee_Work_History,View_Employee_Work_History" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'work-history/:action',
        loadComponent: () => import(`./components/work-history/add-edit/add-edit.component`).then(c => c.AddEditComponent),

        data: { breadcrumb: 'Work History', permission: "Create_Employee_Work_History,Edit_Employee_Work_History" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'education-history',
        loadComponent: () => import(`./components/education/education.component`).then(c => c.EducationComponent),

        data: { breadcrumb: 'Education History', permission: "View_Employee_Education,Delete_Employee_Education,Edit_Employee_Education,Create_Employee_Education" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'education-history/:action',
        loadComponent: () => import(`./components/education/add-edit/add-edit.component`).then(c => c.AddEditComponent),

        data: { breadcrumb: 'Education History', permission: "Edit_Employee_Education,Create_Employee_Education" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'payroll',
        loadComponent: () => import(`./components/payroll/payroll.component`).then(c => c.PayrollComponent),

        data: { breadcrumb: 'Payroll', permission: "Create_Employee_Payroll,Edit_Employee_Payroll,View_Employee_Payroll,Delete_Employee_Payroll" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'payroll/:action',
        loadComponent: () => import(`./components/payroll/add-edit/add-edit.component`).then(c => c.AddEditComponent),

        data: { breadcrumb: 'Payroll', permission: "Create_Employee_Payroll,Edit_Employee_Payroll,View_Employee_Payroll,Delete_Employee_Payroll" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'department-team/:action',
        loadComponent: () => import(`./components/department-team/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title: 'Add Department & Team',
        data: { breadcrumb: 'Department & Team', permission: "Create_Department_Team,Edit_Department_Team,View_Department_Team,Delete_Department_Team" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'shift/:action',
        loadComponent: () => import(`./components/shift/shift-history.component`).then(c => c.ShiftHistoryComponent),
        title: 'Add Shift',
        data: { breadcrumb: 'Shift', permission: "Create_Employee_Shift,Edit_Employee_Shift,View_Employee_Shift,Delete_Employee_Shift" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },
      {
        path: 'change-password',
        loadComponent: () => import(`./components/change-pass/change-pass.component`).then(c => c.ChangePassComponent),
        title: 'Change Password',
        data: { breadcrumb: 'Change Password', permission: "Create_Employee_Change_Password,Edit_Employee_Change_Password,View_Employee_Change_Password,Delete_Employee_Change_Password" },
        resolve: { permission: PermissionService },
        canActivate: [ProtectedGuard]
      },

    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
