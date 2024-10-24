import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'company-structure',
    loadComponent: () => import(`./company/company-list/company-list.component`).then(c => c.CompanyListComponent),
    title: 'Company Structure',
  },
  {
    path: 'job-detail',
    loadComponent: () => import(`./job/job-list/job-list.component`).then(c => c.JobListComponent),
    title: 'Job Detail',
  },
  {
    path: 'qualifications',
    loadComponent: () => import(`./qualifications/qualifications-list/qualifications-list.component`).then(c => c.QualificationsListComponent),
    title: 'Qualifications',
  },
  {
    path: 'projects',
    loadComponent: () => import(`./project/project-list/project-list.component`).then(c => c.ProjectListComponent),
    title: 'Projects',
  },
  {
    path: 'clients',
    loadComponent: () => import(`./client/client-list/client-list.component`).then(c => c.ClientListComponent),
    title: 'Clients',
  },
  {
    path: 'company/:action',
    loadComponent: () => import(`./company/add-edit-company/add-edit-company.component`).then(c => c.AddEditCompanyComponent),
    title: 'Company',
  },
  {
    path: 'qualifications/:action',
    loadComponent: () => import(`./qualifications/add-edit-qualification/add-edit-qualification.component`).then(c => c.AddEditQualificationComponent),
    title: 'Qualifications',
  },
  {
    path: 'job/:action',
    loadComponent: () => import(`./job/add-edit-job/add-edit-job.component`).then(c => c.AddEditJobComponent),
    title: 'Job',
  },
  {
    path: 'project/:action',
    loadComponent: () => import(`./project/add-edit-project/add-edit-project.component`).then(c => c.AddEditProjectComponent),
    title: 'Project',
  },
  {
    path: 'client/:action',
    loadComponent: () => import(`./client/add-edit-client/add-edit-client.component`).then(c => c.AddEditClientComponent),
    title: 'Client',
  },
  {
    path: 'role',
    loadComponent: () => import(`./role/role-list/role-list.component`).then(c => c.RoleListComponent),
    title: 'Role',
  },
  {
    path: 'role/:action',
    loadComponent: () => import(`./role/role-add-edit/role-add-edit.component`).then(c => c.RoleAddEditComponent),
    title: 'Role',
  },
  {
    path: 'shift',
    loadComponent: () => import(`./shift/shift-list/shift-list.component`).then(c => c.ShiftListComponent),
    title: 'Shift',
  },
  {
    path: 'shift/:action',
    loadComponent: () => import(`./shift/shift-add-edit/shift-add-edit.component`).then(c => c.ShiftAddEditComponent),
    title: 'Shift',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
