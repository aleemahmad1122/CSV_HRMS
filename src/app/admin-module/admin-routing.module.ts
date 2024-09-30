import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'company-structure',
    loadComponent: () => import(`./company/company-list/company-list.component`).then(c => c.CompanyListComponent),
    title:'Company Structure',
  },
  {
    path: 'job-detail',
    loadComponent: () => import(`./job/job-list/job-list.component`).then(c => c.JobListComponent),
    title:'Job Detail',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }