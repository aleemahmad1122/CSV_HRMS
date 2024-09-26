import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { PublicGuard } from './shared/guards/public.guard';
import { ProtectedGuard } from './shared/guards/protected.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./authentication-module/authentication.module').then(m => m.AuthenticationModule),
        canActivate: [PublicGuard]
    },

    {
        path: 'admin',
        loadChildren: () => import('./admin-module/admin-module.module').then(m => m.AdminModuleModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard-module/dashboard.module').then(m => m.DashboardModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: 'profile',
        loadChildren: () => import('./profile-module/profile.module').then(m => m.ProfileModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: 'configuration',
        loadChildren: () => import('./configuration-module/configuration.module').then(m => m.ConfigurationModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: 'expense',
        loadChildren: () => import('./expense-module/expense-routing.module').then(m => m.ExpenseRoutingModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: 'invoice',
        loadChildren: () => import('./invoice-module/invoice-routing.module').then(m => m.InvoiceRoutingModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: 'bank',
        loadChildren: () => import('./bank-module/bank-routing.module').then(m => m.BankRoutingModule),
        canActivate: [ProtectedGuard]
    },

    {
        path: '**',
        loadChildren: () => import('./shared/components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent),
        title: 'Page Not Found'
    },
];
