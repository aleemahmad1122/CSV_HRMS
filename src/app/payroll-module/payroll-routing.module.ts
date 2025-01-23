import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from '../shared/resolvers/permission.service';


const routes: Routes = [
  {
      path: 'salary-component',
      loadComponent: () => import(`./components/salary-component/salary-component.component`).then(c => c.SalaryComponentComponent),
      title: 'Salary Component',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Component',permission:"View_Asset,Create_Asset,Edit_Asset,HR_Approval" }
  },
  {
      path: 'salary-component/:action',
      loadComponent: () => import(`./components/salary-component/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Salary Component',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Component',permission:"View_Asset,Create_Asset,Edit_Asset,HR_Approval" }
  },
  {
      path: 'salary-frequency',
      loadComponent: () => import(`./components/salary-frequency/salary-frequency.component`).then(c => c.SalaryFrequencyComponent),
      title: 'Salary Frequency',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Frequency',permission:"View_Asset,Create_Asset,Edit_Asset,HR_Approval" }
  },
  {
      path: 'salary-frequency/:action',
      loadComponent: () => import(`./components/salary-frequency/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Salary Frequency',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Frequency',permission:"View_Asset,Create_Asset,Edit_Asset,HR_Approval" }
  },
  {
      path: 'group',
      loadComponent: () => import(`./components/group/group.component`).then(c => c.GroupComponent),
      title: 'Group',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Group',permission:"View_Asset,Create_Asset,Edit_Asset,HR_Approval" }
  },
  {
      path: 'group/:action',
      loadComponent: () => import(`./components/group/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Group',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Group',permission:"View_Asset,Create_Asset,Edit_Asset,HR_Approval" }
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PayrollRoutingModule { }
