import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionService } from '../shared/resolvers/permission.service';


const routes: Routes = [
    {
        path: 'leave-list',
        loadComponent: () => import(`./leave/leave/leave.component`).then(c => c.LeaveComponent),
        title: 'Leave List',
        resolve: { permission: PermissionService },
        data: { breadcrumb: 'Leave List',permission:"View_Leave,Apply_Leave,Edit_Leave,Leave_Approval,HR_Approval" }
    },
    {
        path: 'request',
        loadComponent: () => import(`./leave/components/request/request.component`).then(c => c.RequestComponent),
        title: 'Leave Request',
        resolve: { permission: PermissionService },
        data: { breadcrumb: 'Leave List',permission:"View_Leave,Apply_Leave,Edit_Leave,Leave_Approval,HR_Approval" }
    },
    {
        path: 'leave/:action',
        loadComponent: () => import(`./leave/add-edit/add-edit.component`).then(c => c.AddEditComponent),
        title: 'Leave',
        resolve: { permission: PermissionService },
        data: { breadcrumb: 'Leave Detail',permission:"Apply_Leave,Edit_Leave" }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AttendanceRoutingModule { }
