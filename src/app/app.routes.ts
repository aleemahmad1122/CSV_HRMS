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
    data: { breadcrumb: 'Admin' },
    canActivate: [ProtectedGuard]
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard-module/dashboard.module').then(m => m.DashboardModule),
    data: { breadcrumb: 'Dashboard' },
    canActivate: [ProtectedGuard]
  },



  {
    path: 'employee',
    loadChildren: () => import('./employee-module/employee.module').then(m => m.EmployeeModuleModule),
    data: { breadcrumb: 'Employee' },
    canActivate: [ProtectedGuard]
  },


  {
    path: 'attendance',
    loadChildren: () => import('./attendance-module/attendance.module').then(m => m.AttendanceModuleModule),
    data: { breadcrumb: 'Attendance' },
    canActivate: [ProtectedGuard]
  },


  {
    path: 'leave',
    loadChildren: () => import('./leave-module/leave-module.module').then(m => m.LeaveModuleModule),
    data: { breadcrumb: 'Leave' },
    canActivate: [ProtectedGuard]
  },

  {
    path: 'payroll',
    loadChildren: () => import('./payroll-module/payroll-module.module').then(m => m.PayrollModuleModule),
    data: { breadcrumb: 'Payroll' },
    canActivate: [ProtectedGuard]
  },

  {
    path: 'loan',
    loadChildren: () => import('./loan-module/loan-module.module').then(m => m.LoanModuleModule),
    data: { breadcrumb: 'Loan' },
    canActivate: [ProtectedGuard]
  },

  {
    path: '**',
    redirectTo: "",
    title: 'Page Not Found'
  },
];
