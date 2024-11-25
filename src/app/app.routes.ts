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
        data:{ breadcrumb: 'Admin' },
       // canActivate: [ProtectedGuard]
    },

    {
        path: 'admin-report',
        loadChildren: () => import('./admin-report-module/admin-report.module').then(m => m.AdminReportModuleModule),
        data:{ breadcrumb: 'Admin Report' },
       // canActivate: [ProtectedGuard]
    },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard-module/dashboard.module').then(m => m.DashboardModule),
        data:{ breadcrumb: 'Dashboard' },
       // canActivate: [ProtectedGuard]
    },

    {
        path: 'profile',
        loadChildren: () => import('./profile-module/profile.module').then(m => m.ProfileModule),
        data:{ breadcrumb: 'Profile' },
       // canActivate: [ProtectedGuard]
    },


    {
        path: 'employee',
        loadChildren: () => import('./employee-module/employee.module').then(m => m.EmployeeModuleModule),
        data:{ breadcrumb: 'Employee' },
        //// canActivate: [ProtectedGuard]
    },


    {
        path: 'attendance',
        loadChildren: () => import('./attendance-module/attendance.module').then(m => m.AttendanceModuleModule),
        data:{ breadcrumb: 'Attendance' },
       // canActivate: [ProtectedGuard]
    },

    {
        path: '**',
        redirectTo:"",
        title: 'Page Not Found'
    },
];
