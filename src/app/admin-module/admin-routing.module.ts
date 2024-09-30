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
    path: 'company/:action',
    loadComponent: () => import(`./company/add-edit-company/add-edit-company.component`).then(c => c.AddEditCompanyComponent),
    title: 'Company',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
