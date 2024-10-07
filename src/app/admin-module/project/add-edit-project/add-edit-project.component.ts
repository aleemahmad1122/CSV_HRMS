import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../../shared/Services/user-authentication.service';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';

interface Status {
  statusId: number;
  statusName: string;
}
@Component({
  selector: 'app-add-edit-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-edit-project.component.html',
  styleUrl: './add-edit-project.component.css'
})
export class AddEditProjectComponent {
  private ngUnsubscribe = new Subject<void>();
  companyForm!: FormGroup;
  isEditMode: boolean = false;
  defaultImagePath = '../../../assets/media/users/blank.png';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;
  selectedCompany: any;
  isSubmitted = false;

  status: Status[] = [
    { statusId: 1, statusName: 'Active' },
    { statusId: 2, statusName: 'Inactive' },
    { statusId: 3, statusName: 'On Hold' },
  ];

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _route: ActivatedRoute,
    private _toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      this.isEditMode = false;
      this.selectedCompany = {};
      if (params['companyId'] !== undefined && params['companyId'] !== null && params['companyId'] !== '' && params['companyId'] !== 0) {
        this.isEditMode = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedCompany = JSON.parse(localStorage.getItem('company')!);
        }
      }
    });
  }

  ngOnInit(): void {
    this.isEditMode = this._router.url.includes('edit');

    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', Validators.required],
      budget: ['', Validators.required],
      currency: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.companyForm.valid) {
      return;
    }

    var formData = new FormData();

    formData.append('name', this.companyForm.get('name')?.value);
    formData.append('status', this.companyForm.get('status')?.value);
    formData.append('startDate', this.companyForm.get('startDate')?.value);
    formData.append('endDate', this.companyForm.get('endDate')?.value);
    formData.append('budget', this.companyForm.get('budget')?.value);
    formData.append('currency', this.companyForm.get('currency')?.value);
    formData.append('description', this.companyForm.get('description')?.value);

    if (!this.isEditMode) {
      this._apiCalling.postData("company", "add", formData, true)
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
            this._toaster.error("Internal server error occurred while processing your request")
          }
        })
    } else {
      this._apiCalling.putData("company", "edit/" + this.selectedCompany.companyId + "", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.goBack();
            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occurred while processing your request")
          }
        })
    }
  }

  goBack() {
    this._router.navigate([`${'/admin/projects'}`]);
  }
}
