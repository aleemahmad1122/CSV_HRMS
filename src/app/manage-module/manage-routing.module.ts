import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '', children: [
      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'document',
        loadComponent: () => import(`./document/list/list.component`).then(c => c.ListComponent),
        title:'Manage Document',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'document/:action',
          loadComponent: () => import(`./document/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Document',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'attendance',
          loadComponent: () => import(`./attendance/list/list.component`).then(c => c.ListComponent),
        title:'Manage Attendance',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'attendance/:action',
          loadComponent: () => import(`./attendance/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Attendance',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'travel',
          loadComponent: () => import(`./travel/list/list.component`).then(c => c.ListComponent),
        title:'Manage Travel',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'travel/:action',
          loadComponent: () => import(`./travel/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Travel',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'overtime',
          loadComponent: () => import(`./overtime/list/list.component`).then(c => c.ListComponent),
        title:'Manage Overtime',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'overtime/:action',
          loadComponent: () => import(`./overtime/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Overtime',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'loans',
          loadComponent: () => import(`./loans/list/list.component`).then(c => c.ListComponent),
        title:'Manage Loans',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'loans/:action',
          loadComponent: () => import(`./loans/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title:'Add Loans',
        canActivate: [ProtectedGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule { }
