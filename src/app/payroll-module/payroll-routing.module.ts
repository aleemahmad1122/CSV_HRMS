import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from '../shared/resolvers/permission.service';


const routes: Routes = [
  {
      path: 'salary-component',
      loadComponent: () => import(`./components/salary-component/salary-component.component`).then(c => c.SalaryComponentComponent),
      title: 'Salary Component',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Component',permission:"View_Leave,Apply_Leave,Edit_Leave,Leave_Approval,HR_Approval" }
  },
  {
      path: 'salary-component/:action',
      loadComponent: () => import(`./components/salary-component/add-edit/add-edit.component`).then(c => c.AddEditComponent),
      title: 'Salary Component',
      resolve: { permission: PermissionService },
      data: { breadcrumb: 'Salary Component',permission:"View_Leave,Apply_Leave,Edit_Leave,Leave_Approval,HR_Approval" }
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PayrollRoutingModule { }
