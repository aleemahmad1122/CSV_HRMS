import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from '../shared/resolvers/permission.service';


const routes: Routes = [
  {
      path: 'salary-component',
      loadComponent: () => import(`./components/salary-component/salary-component.component`).then(c => c.SalaryComponentComponent),
      title: 'Salary Component',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Component',permission:"View_Salary_Component,Delete_Salary_Component,Edit_Salary_Component,Create_Salary_Component" }
  },
  {
      path: 'salary-component/:action',
      loadComponent: () => import(`./components/salary-component/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Salary Component',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Component',permission:"Edit_Salary_Component,Create_Salary_Component,View_Salary_Component" }
  },
  {
      path: 'salary-frequency',
      loadComponent: () => import(`./components/salary-frequency/salary-frequency.component`).then(c => c.SalaryFrequencyComponent),
      title: 'Salary Frequency',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Frequency',permission:"View_Salary_Frequency,Edit_Salary_Frequency,Delete_Salary_Frequency,Create_Salary_Frequency" }
  },
  {
      path: 'salary-frequency/:action',
      loadComponent: () => import(`./components/salary-frequency/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Salary Frequency',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Frequency',permission:"View_Salary_Frequency,Edit_Salary_Frequency,Delete_Salary_Frequency,Create_Salary_Frequency" }
  },
  {
      path: 'group',
      loadComponent: () => import(`./components/group/group.component`).then(c => c.GroupComponent),
      title: 'Group',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Group',permission:"View_Paygroup,Create_Paygroup,Edit_Paygroup,Delete_Paygroup" }
  },
  {
      path: 'group/:action',
      loadComponent: () => import(`./components/group/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Group',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Group',permission:"View_Paygroup,Create_Paygroup,Edit_Paygroup,Delete_Paygroup" }
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PayrollRoutingModule { }
