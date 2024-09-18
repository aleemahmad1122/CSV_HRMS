import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { CommonModule } from '@angular/common';
import { DataShareService } from '../../shared/Services/data-share.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  loginForm!: FormGroup;
  isShowPassword: boolean = false;
  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService) {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitLoginForm(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this._apiCalling.postData("auth", "login",
      {
        "email": this.loginForm.get('email')?.value,
        "password": this.loginForm.get('password')?.value
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._authService.saveUser(response?.data?.user);
            this._authService.saveUserRole(response?.data?.user?.role);
            this._authService.setToken(response?.data?.token);
            this._dataShare.updateLoginStatus(true);
            this._router.navigate([`${'/dashboard'}`]);

          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

}
