import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '', children: [
      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'employee-list',
        loadComponent: () => import(`./employee-list/employee-list.component`).then(c => c.EmployeeListComponent),
        title:'Manage Employee',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'employee/:action',
        loadComponent: () => import(`./add-edit-module/add-edit-module.component`).then(c => c.AddEditModuleComponent),
        title:'Add Employee',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'work-history/:action',
        loadComponent: () => import(`./components/work-history/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Employee',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'education-history/:action',
        loadComponent: () => import(`./components/education/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Employee',
        canActivate: [ProtectedGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
