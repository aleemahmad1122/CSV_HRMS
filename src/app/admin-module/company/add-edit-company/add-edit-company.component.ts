import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';
import { UserAuthenticationService } from '../../../shared/Services/user-authentication.service';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

interface Typess {
  typeId: number;
  typeName: string;
}

@Component({
  selector: 'app-add-edit-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-edit-company.component.html',
  styleUrl: './add-edit-company.component.css'
})

export class AddEditCompanyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  companyForm!: FormGroup;
  isEditMode: boolean = false;
  defaultImagePath = '../../../assets/media/users/blank.png';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;
  selectedCompany: any;

  types: Typess[] = [
    { typeId: 1, typeName: 'Head Office' },
    { typeId: 2, typeName: 'Branch' },
    { typeId: 3, typeName: 'Subsidiary' },
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
      companyImage: ['', Validators.required],
      name: ['', Validators.required],
      details: ['', Validators.required],
      address: ['', Validators.required],
      type: ['', Validators.required],
      country: ['', Validators.required],
      timeZone: ['', Validators.required],
      parentStructure: ['', Validators.required],
      heads: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm() {
    if (!this.companyForm.valid) {
      return;
    }

    if (!this.isEditMode) {
      var formData = new FormData();

      if (this.selectedFile) {
        formData.append('companyImage', this.selectedFile);
      }
      formData.append('name', this.companyForm.get('name')?.value);
      formData.append('heads', this.companyForm.get('heads')?.value);
      formData.append('type', this.companyForm.get('type')?.value);
      formData.append('country', this.companyForm.get('country')?.value);
      formData.append('timeZone', this.companyForm.get('timeZone')?.value);
      formData.append('parentStructure', this.companyForm.get('parentStructure')?.value);
      formData.append('address', this.companyForm.get('address')?.value);
      formData.append('details', this.companyForm.get('details')?.value);

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
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    }
    else {
      var formData = new FormData();

      if (this.selectedFile) {
        formData.append('companyImage', this.selectedFile);
      }
      formData.append('name', this.companyForm.get('name')?.value);
      formData.append('heads', this.companyForm.get('heads')?.value);
      formData.append('type', this.companyForm.get('type')?.value);
      formData.append('country', this.companyForm.get('country')?.value);
      formData.append('timeZone', this.companyForm.get('timeZone')?.value);
      formData.append('parentStructure', this.companyForm.get('parentStructure')?.value);
      formData.append('address', this.companyForm.get('address')?.value);
      formData.append('details', this.companyForm.get('details')?.value);

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
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    }
  }

  goBack() {
    this._router.navigate([`${'/admin/company-structure'}`]);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > this.maxSizeInBytes) {
        this.imageSizeExceeded = true;
        return;
      }

      this.imageSizeExceeded = false;
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imagePreview = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = this.defaultImagePath;
    this.selectedFile = null;
    this.imageSizeExceeded = false;
  }

}
