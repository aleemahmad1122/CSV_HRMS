import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import(`./login/login.component`).then(c => c.LoginComponent),
    title: 'Login',
  },
  {
    path: 'sign-up',
    loadComponent: () => import(`./sign-up/sign-up.component`).then(c => c.SignUpComponent),
    title: 'Sign Up',
  },
  {
    path: 'forgot-password',
    loadComponent: () => import(`./forgot-password/forgot-password.component`).then(c => c.ForgotPasswordComponent),
    title: 'Forgot Password',
  },
  {
    path: 'reset-password',
    loadComponent: () => import(`./reset-password/reset-password.component`).then(c => c.ResetPasswordComponent),
    title: 'Reset Password',
  },
  {
    path: 'set-password',
    loadComponent: () => import(`./set-password/set-password.component`).then(c => c.SetPasswordComponent),
    title: 'Set Password',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
