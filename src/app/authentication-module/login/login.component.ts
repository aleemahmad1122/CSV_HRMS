import { Component, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
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
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  loginForm!: FormGroup;
  companyList: CompanyDetail[] = [];
  showPassword: boolean = false;
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
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  handlePageRefresh(event: Event): void {
    // Clear session and logout the user
    this.logoutUser();
  }

  selectCompany(company: CompanyDetail | null): void {
    if (!company) {
      this._toaster.error("No company selected. Please select a company to proceed.");
      $('#selectCompanyModal').modal('hide');
      return;
    }

    this._dataShare.updateLoginStatus(true);
    this._localStorageService.setCompanyDetail(company);

    const relatedEmployees = this._localStorageService.getEmployeeDetail().filter(
      (employee: any) => employee.companyId === company.companyId
    );

    this._localStorageService.setEmployeeDetail(relatedEmployees);

    if (typeof $ !== 'undefined') {
      $('#selectCompanyModal').modal('hide');
    }

    this._router.navigateByUrl('dashboard');
  }

  submitLoginForm(): void {
    if (!this.loginForm.valid) {
      this._toaster.error("Invalid form. Please fill in all required fields.");
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

          this.companyList = response.data?.companyDetail || [];
          if (this.companyList.length > 1) {
            $('#selectCompanyModal').modal('show');
          } else if (this.companyList.length === 1) {
            this.selectCompany(this.companyList[0]);
          } else {
            this._toaster.error("No companies found for this user.");
          }

          this._authService.setToken(response.data?.employeeDetail[0]?.token);
          this._localStorageService.setEmployeeDetail(response.data?.employeeDetail || []);
        },
        error: (error) => {
          console.error(error); // Log the error for debugging
          this._toaster.error("Internal server error occurred while processing your request.");
        }
      });
  }

  logoutUser(): void {
    this._dataShare.updateLoginStatus(false);
    this._router.navigateByUrl('/login');
    this._toaster.info("You have been logged out due to page refresh.");
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
