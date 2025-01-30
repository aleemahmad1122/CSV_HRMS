import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from '../shared/resolvers/permission.service';


const routes: Routes = [
    {
        path: 'list',
        loadComponent: () => import(`./loan/loan.component`).then(c => c.LoanComponent),
        title: 'Loan List',
        resolve: { permission: PermissionService },
        data: { breadcrumb: 'Loan List',permission:"View_Leave,Apply_Leave,Edit_Leave,Leave_Approval,HR_Approval" }
    },
    {
        path: 'request',
        loadComponent: () => import(`./loan/components/request/request.component`).then(c => c.RequestComponent),
        title: 'Loan Request',
        resolve: { permission: PermissionService },
        data: { breadcrumb: 'Loan Request',permission:"View_Leave_Requests,Apply_Leave,Edit_Leave,Leave_Approval,HR_Approval" }
    },
    {
        path: 'loan/:action',
        loadComponent: () => import(`./loan/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title: 'loan',
        resolve: { permission: PermissionService },
        data: { breadcrumb: 'Loan Detail',permission:"Apply_Leave,Edit_Leave" }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoanRoutingModule { }
