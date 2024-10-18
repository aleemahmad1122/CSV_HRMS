import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import {LocalStorageManagerService} from "../../shared/Services/local-storage-manager.service";
import { CompanyDetail } from '../../types';
import { ToastrService } from 'ngx-toastr';
import { DataShareService } from '../../shared/Services/data-share.service';
import { takeUntil } from 'rxjs/operators';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { Subject } from 'rxjs';
declare var $: any;


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  private ngUnsubscribe = new Subject<void>();
  signupForm: FormGroup = new FormGroup({});
  loading = false;
  currentStep = 1;
  companyList: CompanyDetail[] = [];

  constructor(
    private fb: FormBuilder,
    private _localStorageService: LocalStorageManagerService,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _toaster: ToastrService,
    private _dataShare: DataShareService
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required,Validators.email]],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[!@#$%^&*])/)]],
      companyName: ['',Validators.required,],
      address: [''],
      country: [''],
      city: [''],
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  goToNextStep(): void {
    if (this.currentStep === 1 && this.signupForm.get('fullName')?.valid && this.signupForm.get('email')?.valid && this.signupForm.get('password')?.valid) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.signupForm.get('address')?.valid && this.signupForm.get('country')?.valid && this.signupForm.get('city')?.valid) {
      this.currentStep = 3;
    }
  }

  canProceedToNextStep(): boolean | undefined {
    if (this.currentStep === 1) {
      return this.currentStep === 1 && this.signupForm.get('fullName')?.valid && this.signupForm.get('email')?.valid && this.signupForm.get('password')?.valid;
    } else if (this.currentStep === 2) {
      return this.currentStep === 2 && this.signupForm.get('address')?.valid && this.signupForm.get('country')?.valid && this.signupForm.get('city')?.valid;
    }
    return false;
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }





  selectCompany(company: CompanyDetail): void {
    this._dataShare.updateLoginStatus(true);
    this._localStorageService.setCompanyDetail(company);
    $('#selectCompanyModal').modal('hide');
  }



  onSubmit(): void {
    if (this.signupForm.valid && this.currentStep === 3) {
      this._apiCalling.postData("Auth", "signUp", this.signupForm.value, true)
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
      })
    }
  }
}
