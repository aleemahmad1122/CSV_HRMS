import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'company-structure',
    loadComponent: () => import(`./company/company-list/company-list.component`).then(c => c.CompanyListComponent),
    data: { breadcrumb: 'Company Structure' },
    title: 'Company Structure',
  },

  {
    path: 'company/:action',
    loadComponent: () => import(`./company/add-edit-company/add-edit-company.component`).then(c => c.AddEditCompanyComponent),
    data: { breadcrumb: 'Company' },
    title: 'Company',
  },
  {
    path: 'job-detail',
    loadComponent: () => import(`./job/job-list/job-list.component`).then(c => c.JobListComponent),
    data: { breadcrumb: 'Job' },
    title: 'Job Detail',
  },
  {
    path: 'qualifications',
    loadComponent: () => import(`./qualifications/qualifications-list/qualifications-list.component`).then(c => c.QualificationsListComponent),
    data: { breadcrumb: 'Qualifications' },
    title: 'Qualifications',
  },
  {
    path: 'projects',
    loadComponent: () => import(`./project/project-list/project-list.component`).then(c => c.ProjectListComponent),
    data: { breadcrumb: 'Projects' },
    title: 'Projects',
  },
  {
    path: 'project/:action',
    loadComponent: () => import(`./project/add-edit-project/add-edit-project.component`).then(c => c.AddEditProjectComponent),
    data: { breadcrumb: 'Project' },
    title: 'Project',
  },
  {
    path: 'clients',
    loadComponent: () => import(`./client/client-list/client-list.component`).then(c => c.ClientListComponent),
    data: { breadcrumb: 'Clients' },
    title: 'Clients',
  },
  {
    path: 'client/:action',
    loadComponent: () => import(`./client/add-edit-client/add-edit-client.component`).then(c => c.AddEditClientComponent),
    data: { breadcrumb: 'Client' },
    title: 'Client',
  },
  {
    path: 'qualifications/:action',
    loadComponent: () => import(`./qualifications/add-edit-qualification/add-edit-qualification.component`).then(c => c.AddEditQualificationComponent),
    data: { breadcrumb: 'Qualifications' },
    title: 'Qualifications',
  },
  {
    path: 'job/:action',
    loadComponent: () => import(`./job/add-edit-job/add-edit-job.component`).then(c => c.AddEditJobComponent),
    data: { breadcrumb: 'Job' },
    title: 'Job',
  },


  {
    path: 'role',
    loadComponent: () => import(`./role/role-list/role-list.component`).then(c => c.RoleListComponent),
    data: { breadcrumb: 'Role' },
    title: 'Role',
  },
  {
    path: 'role/:action',
    loadComponent: () => import(`./role/role-add-edit/role-add-edit.component`).then(c => c.RoleAddEditComponent),
    data: { breadcrumb: 'Role' },
    title: 'Role',
  },
  {
    path: 'shift',
    loadComponent: () => import(`./shift/shift-list/shift-list.component`).then(c => c.ShiftListComponent),
    data: { breadcrumb: 'Shift' },
    title: 'Shift',
  },
  {
    path: 'shift/:action',
    loadComponent: () => import(`./shift/shift-add-edit/shift-add-edit.component`).then(c => c.ShiftAddEditComponent),
    data: { breadcrumb: 'Shift' },
    title: 'Shift',
  },
  {
    path: 'designation',
    loadComponent: () => import(`./designation/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Designation' },
    title: 'Designation',
  },
  {
    path: 'designation/:action',
    loadComponent: () => import(`./designation/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Designation' },
    title: 'Designation',
  },
  {
    path: 'department',
    loadComponent: () => import(`./department/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Department' },
    title: 'Department',
  },
  {
    path: 'department/:action',
    loadComponent: () => import(`./department/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Department' },
    title: 'Department',
  },
  {
    path: 'team',
    loadComponent: () => import(`./team/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Team' },
    title: 'Team',
  },
  {
    path: 'team/:action',
    loadComponent: () => import(`./team/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Team' },
    title: 'Team',
  },
  {
    path: 'attachmentType',
    loadComponent: () => import(`./attachmentFile/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Attachment Type' },
    title: 'Attachment Type',
  },
  {
    path: 'attachmentType/:action',
    loadComponent: () => import(`./attachmentFile/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Attachment Type' },
    title: 'Attachment File',
  },

  {
    path: 'leave-type-list',
    loadComponent: () => import(`./leave-type/list/list.component`).then(c => c.ListComponent),
    data: { breadcrumb: 'Leave Type List' },
    title: 'Leave Type List',
  },
  {
    path: 'leave-type/:action',
    loadComponent: () => import(`./leave-type/add-edit/add-edit.component`).then(c => c.AddEditComponent),
    data: { breadcrumb: 'Leave Type' },
    title: 'Leave Type',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
