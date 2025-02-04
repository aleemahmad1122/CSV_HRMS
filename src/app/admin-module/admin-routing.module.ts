import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from "../shared/resolvers/permission.service"


const routes: Routes = [
  {
    path: 'company',
    loadComponent: () => import(`./company/company-list/company-list.component`).then(c => c.CompanyListComponent),
    data: { breadcrumb: 'Company Structure', permission: "View_Company,Create_Company,Edit_Company,Delete_Company" },
    title: 'Company Structure',
    resolve: { permission: PermissionService }
  },

  {
    path: 'company/:action',
    loadComponent: () => import(`./company/add-edit-company/add-edit-company.component`).then(c => c.AddEditCompanyComponent),
    data: { breadcrumb: 'Company', permission: "Create_Company,Edit_Company" },
    title: 'Company',
    resolve: { permission: PermissionService }
  },
  {
    path: 'job',
    loadComponent: () => import(`./job/job-list/job-list.component`).then(c => c.JobListComponent),
    data: { breadcrumb: 'Job', permission: "View_Job,Create_Job,Edit_Job,Delete_Job" },
    title: 'Job Detail',
    resolve: { permission: PermissionService }
  },

  {
    path: 'job/:action',
    loadComponent: () => import(`./job/add-edit-job/add-edit-job.component`).then(c => c.AddEditJobComponent),
    data: { breadcrumb: 'Job', permission: "Create_Job,Edit_Job" },
    title: 'Job',
    resolve: { permission: PermissionService }
  },
  {
    path: 'qualifications',
    loadComponent: () => import(`./qualifications/qualifications-list/qualifications-list.component`).then(c => c.QualificationsListComponent),
    data: { breadcrumb: 'Qualifications', permission: "View_Qualification,Create_Qualification,Edit_Qualification,Delete_Qualification" },
    title: 'Qualifications',
    resolve: { permission: PermissionService }
  },
  {
    path: 'qualifications/:action',
    loadComponent: () => import(`./qualifications/add-edit-qualification/add-edit-qualification.component`).then(c => c.AddEditQualificationComponent),
    data: { breadcrumb: 'Qualifications', permission: "Create_Qualification,Edit_Qualification" },
    title: 'Qualifications',
    resolve: { permission: PermissionService }
  },
  {
    path: 'project',
    loadComponent: () => import(`./project/project-list/project-list.component`).then(c => c.ProjectListComponent),
    data: { breadcrumb: 'Projects', permission: "View_Project,Create_Project,Edit_Project,Delete_Project" },
    title: 'Projects',
    resolve: { permission: PermissionService }
  },
  {
    path: 'project/:action',
    loadComponent: () => import(`./project/add-edit-project/add-edit-project.component`).then(c => c.AddEditProjectComponent),
    data: { breadcrumb: 'Project', permission: "Create_Project,Edit_Project" },
    title: 'Project',
    resolve: { permission: PermissionService }
  },
  {
    path: 'client',
    loadComponent: () => import(`./client/client-list/client-list.component`).then(c => c.ClientListComponent),
    data: { breadcrumb: 'Clients', permission: "View_Client,Create_Client,Edit_Client,Delete_Client" },
    title: 'Clients',
    resolve: { permission: PermissionService }
  },
  {
    path: 'client/:action',
    loadComponent: () => import(`./client/add-edit-client/add-edit-client.component`).then(c => c.AddEditClientComponent),
    data: { breadcrumb: 'Client', permission: "Edit_Client,Create_Client" },
    title: 'Client',
    resolve: { permission: PermissionService }
  },
  {
    path: 'role',
    loadComponent: () => import(`./role/role-list/role-list.component`).then(c => c.RoleListComponent),
    data: { breadcrumb: 'Role', permission: "View_Role,Create_Role,Edit_Role,Delete_Role" },
    title: 'Role',
    resolve: { permission: PermissionService }
  },
  {
    path: 'role/:action',
    loadComponent: () => import(`./role/role-add-edit/role-add-edit.component`).then(c => c.RoleAddEditComponent),
    data: { breadcrumb: 'Role', permission: "Create_Role,Edit_Role" },
    title: 'Role',
    resolve: { permission: PermissionService }
  },
  {
    path: 'shift',
    loadComponent: () => import(`./shift/shift-list/shift-list.component`).then(c => c.ShiftListComponent),
    data: { breadcrumb: 'Shift', permission: "View_Shift,Create_Shift,Edit_Shift,Delete_Shift" },
    title: 'Shift',
    resolve: { permission: PermissionService }
  },
  {
    path: 'shift/:action',
    loadComponent: () => import(`./shift/shift-add-edit/shift-add-edit.component`).then(c => c.ShiftAddEditComponent),
    data: { breadcrumb: 'Shift', permission: "Create_Shift,Edit_Shift,View_Shift" },
    title: 'Shift',
    resolve: { permission: PermissionService }
  },
  {
    path: 'designation',
    loadComponent: () => import(`./designation/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Designation', permission: "View_Designation,Create_Designation,Edit_Designation,Delete_Designation" },
    title: 'Designation',
    resolve: { permission: PermissionService }
  },
  {
    path: 'designation/:action',
    loadComponent: () => import(`./designation/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Designation', permission: "Create_Designation,Edit_Designation" },
    title: 'Designation',
    resolve: { permission: PermissionService }
  },
  {
    path: 'department',
    loadComponent: () => import(`./department/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Department', permission: "View_Department,Create_Department,Edit_Department,Delete_Department" },
    title: 'Department',
    resolve: { permission: PermissionService }
  },
  {
    path: 'department/:action',
    loadComponent: () => import(`./department/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Department', permission: "Create_Department,Edit_Department" },
    title: 'Department',
    resolve: { permission: PermissionService }
  },
  {
    path: 'team',
    loadComponent: () => import(`./team/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Team', permission: "View_Team,Create_Team,Edit_Team,Delete_Team" },
    title: 'Team',
    resolve: { permission: PermissionService }
  },
  {
    path: 'team/:action',
    loadComponent: () => import(`./team/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Team', permission: "Edit_Team,Create_Team" },
    title: 'Team',
    resolve: { permission: PermissionService }
  },
  {
    path: 'attachmentType',
    loadComponent: () => import(`./attachmentFile/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Attachment Type', permission: "View_Attachment_Type,Create_Attachment_Type,Edit_Attachment_Type,Delete_Attachment_Type" },
    title: 'Attachment Type',
    resolve: { permission: PermissionService }
  },
  {
    path: 'attachmentType/:action',
    loadComponent: () => import(`./attachmentFile/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Attachment Type', permission: "Create_Attachment_Type,Edit_Attachment_Type" },
    title: 'Attachment File',
    resolve: { permission: PermissionService }
  },

  {
    path: 'leave-type',
    loadComponent: () => import(`./leave-type/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Leave Type List', permission: "View_Leave_Type,Create_Leave_Type,Edit_Leave_Type,Delete_Leave_Type" },
    title: 'Leave Type List',
    resolve: { permission: PermissionService }
  },
  {
    path: 'leave-type/:action',
    loadComponent: () => import(`./leave-type/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Leave Type', permission: "Edit_Leave_Type,Create_Leave_Type" },
    title: 'Leave Type',
    resolve: { permission: PermissionService }
  },

  {
    path: 'assets',
    loadComponent: () => import(`./assets/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Assets List', permission: "View_Asset,Create_Asset,Edit_Asset,Delete_Asset" },
    title: 'Assets List',
    resolve: { permission: PermissionService }
  },
  {
    path: 'assets/:action',
    loadComponent: () => import(`./assets/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Assets', permission: "Edit_Asset,Create_Asset" },
    title: 'Assets List',
    resolve: { permission: PermissionService }
  },
  {
    path: 'asset-type',
    loadComponent: () => import(`./assets/type/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Assets Type', permission: "View_Asset_Type,Create_Asset_Type,Edit_Asset_Type,Delete_Asset_Type" },
    title: 'Assets Type',
    resolve: { permission: PermissionService }
  },
  {
    path: 'assets-type/:action',
    loadComponent: () => import(`./assets/type//add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Assets Type', permission: "Edit_Asset_Type,Create_Asset_Type" },
    title: 'Assets Type',
    resolve: { permission: PermissionService }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
