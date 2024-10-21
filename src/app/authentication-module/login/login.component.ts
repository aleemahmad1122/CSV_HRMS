import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { CommonModule } from '@angular/common';
import { DataShareService } from '../../shared/Services/data-share.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageManagerService } from "../../shared/Services/local-storage-manager.service";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompanyDetail } from '../../types';
declare var $: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent  {
  private ngUnsubscribe = new Subject<void>();
  loginForm!: FormGroup;
  companyList: CompanyDetail[] = [];
  isShowPassword: boolean = false;
  @ViewChild('selectCompanyModal') selectCompanyModal!: ModalDirective;

  constructor(
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _localStorageService: LocalStorageManagerService,
    private _dataShare: DataShareService
  ) {

    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[!@#$%^&*])/)]],
    });
  }

  selectCompany(company: CompanyDetail): void {
    this._dataShare.updateLoginStatus(true);
    this._localStorageService.setCompanyDetail(company);
    $('#selectCompanyModal').modal('hide');
    this._router.navigateByUrl('dashboard');
  }

  submitLoginForm(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this._apiCalling.postData("Auth", "login", this.loginForm.value, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response?.status === 400 && !response.success) {
            this._toaster.error(response.message);
            return;
          }
          this.companyList = response.data.companyDetail
          if (response.data.companyDetail.length > 1) {

            console.log("arbabzafar4444@gmail.com");

            $('#selectCompanyModal').modal('show');

          } else {
            this._localStorageService.setCompanyDetail(response.data.companyDetail[0]);
            this._dataShare.updateLoginStatus(true);
          }
          this._authService.setToken(response.data.token);
                    this._localStorageService.setEmployeeDetail(response.data.employeeDetail);

        },
        error: (error) => {
          console.error(error); // Log the error for debugging
          this._toaster.error("Internal server error occurred while processing your request");
        }
      });
  }

}
