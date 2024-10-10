import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { DataShareService } from '../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-edit-module.component.html',
  styleUrl: './add-edit-module.component.css'
})
export class AddEditModuleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  employeeForm!: FormGroup;
  isEditMode: boolean = false;
  defaultImagePath = '../../../assets/media/users/blank.png';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;
  selectedEmployee: any;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _route: ActivatedRoute,
    private _toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._route.queryParams.subscribe(params => {
      this.isEditMode = false;
      this.selectedEmployee = {};
      if (params['employeeId'] !== undefined && params['employeeId'] !== null && params['employeeId'] !== '' && params['employeeId'] !== 0) {
        this.isEditMode = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedEmployee = JSON.parse(localStorage.getItem('employee')!);
        }
      }
    });
  }

  ngOnInit(): void {
    this.isEditMode = this._router.url.includes('edit');

    this.employeeForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      nationality: ['', Validators.required],
      birthday: ['', Validators.required],
      gender: ['', Validators.required],
      marital_status: ['', Validators.required],
      ethnicity: ['', Validators.required],
      immigration_status: ['', Validators.required],
      ssn_num: ['', Validators.required],
      nic_num: ['', Validators.required],
      other_id: [''],
      driving_license: [''],
      employment_status: ['', Validators.required],
      department: ['', Validators.required],
      job_title: ['', Validators.required],
      pay_grade: ['', Validators.required],
      joined_date: ['', Validators.required],
      confirmation_date: [''],
      termination_date: [''],
      work_station_id: [''],
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      province: [''],
      postal_code: ['', Validators.required],
      home_phone: ['', Validators.required],
      work_email: ['', [Validators.required, Validators.email]],
      private_email: ['', [Validators.required, Validators.email]]
    });

    if (this.isEditMode && this.selectedEmployee) {
      this.employeeForm.patchValue(this.selectedEmployee);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm() {
    if (!this.employeeForm.valid) {
      return;
    }

    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('companyImage', this.selectedFile);
    }

    const employeeData = {
      employee: this.employeeForm.value
    };

    Object.keys(employeeData.employee).forEach(key => {
      formData.append(`employee[${key}]`, employeeData.employee[key]);
    });

    const endpoint = this.isEditMode ? `edit/${this.selectedEmployee.employeeId}` : 'add';
    const method = this.isEditMode ? this._apiCalling.putData : this._apiCalling.postData;

    method.call(this._apiCalling, "employee", endpoint, formData, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            if (!this.isEditMode) {
              this._authService.saveUser(response?.data?.user);
              this._authService.saveUserRole(response?.data?.user?.role);
              this._authService.setToken(response?.data?.token);
              this._dataShare.updateLoginStatus(true);
              this._router.navigate(['/dashboard']);
            } else {
              this._toaster.success(response?.message, 'Success!');
              this.goBack();
            }
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occurred while processing your request");
        }
      });
  }

  goBack() {
    this._router.navigate(['/admin/employees']);
  }
}
