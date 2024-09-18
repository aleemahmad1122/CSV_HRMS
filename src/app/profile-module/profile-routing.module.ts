import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',

        loadComponent: () => import(`./profile/profile.component`).then(c => c.ProfileComponent),
        children: [
            {
                path: 'info',
                loadComponent: () => import(`./profile-info/profile-info.component`).then(c => c.ProfileInfoComponent),
            },
            {
                path: 'overview',
                loadComponent: () => import(`./overview/overview.component`).then(c => c.OverviewComponent),
            },
            {
                path: 'acc-info',
                loadComponent: () => import(`./acc-info/acc-info.component`).then(c => c.AccInfoComponent),
            },
            {
                path: 'change-password',
                loadComponent: () => import(`./change-password/change-password.component`).then(c => c.ChangePasswordComponent),
            },
        ],
        title: 'Profile',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
