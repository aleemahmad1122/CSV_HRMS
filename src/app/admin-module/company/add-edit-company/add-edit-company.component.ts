import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ICompany } from "../../../types/index";
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

interface Typess {
  typeId: string;
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
  isEditMode: boolean | string = false;
  defaultImagePath = 'https://s3.us-east-2.amazonaws.com/digitalhealth.prod/DigitalHealth/1624343086078_default_company_image.jpg';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;
  selectedCompany: ICompany;
  isSubmitted = false;


  countries: { id: string; name: string }[] = [
    { id: 'PK', name: 'Pakistan' },
    { id: 'US', name: 'United States' },
    { id: 'IN', name: 'India' },
    { id: 'CA', name: 'Canada' },
    { id: 'DE', name: 'Germany' },
    { id: 'FR', name: 'France' },
    { id: 'SA', name: 'Saudi Arabia' },
    { id: 'AE', name: 'United Arab Emirates' },
    { id: 'JP', name: 'Japan' },
    { id: 'CN', name: 'China' },
  ];
  types: Typess[] = [
    { typeId: "1", typeName: 'Head Office' },
    { typeId: "2", typeName: 'Branch' },
    { typeId: "3", typeName: 'Subsidiary' },
  ];

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _dataShare: DataShareService,
    private _route: ActivatedRoute,
    private _toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      const companyId = params['id'];
      this.isEditMode = companyId !== undefined && companyId !== null && companyId !== '' && companyId !== 0;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this._apiCalling.getData("Company", `getCompanyById/${companyId}`, true).subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.selectedCompany = response.data;
              this.patchFormValues();
            } else {
              this._toaster.error('Company not found', 'Error!');
              this._router.navigate(['/admin/company-structure']);
            }
          },
          error: () => {
            this._toaster.error('Error fetching company details', 'Error!');
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.isEditMode = this._router.url.includes('edit');

    this.companyForm = this.fb.group({
      companyImage: [''], // Added field for company image
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      faxNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      website: ['', Validators.required],
      registrationNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      country: ['', Validators.required],
      industry: ['', Validators.required],
      firstAddress: ['', Validators.required],
      secondAddress: [''],
      employeesCount: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      foundedDate: ['', Validators.required],
      companyType: [2]
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private patchFormValues(): void {
    if (this.selectedCompany) {
      this.companyForm.patchValue({
        name: this.selectedCompany.name,
        email: this.selectedCompany.email,
        phoneNumber: this.selectedCompany.phoneNumber,
        faxNumber: this.selectedCompany.faxNumber,
        website: this.selectedCompany.website,
        registrationNumber: this.selectedCompany.registrationNumber,
        country: this.selectedCompany.countryId,
        industry: this.selectedCompany.industryId,
        firstAddress: this.selectedCompany.firstAddress,
        secondAddress: this.selectedCompany.secondAddress,
        employeesCount: this.selectedCompany.employeesCount,
        foundedDate: this.selectedCompany.foundedDate,
        companyType: this.selectedCompany.companyType || 2,
      });
      this.imagePreview = this.selectedCompany.companyImage || this.defaultImagePath
    }


  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.companyForm.valid) {
      return;
    }

    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('companyImage', this.selectedFile);
    }
    formData.append('name', this.companyForm.get('name')?.value);
    formData.append('email', this.companyForm.get('email')?.value);
    formData.append('phoneNumber', this.companyForm.get('phoneNumber')?.value);
    formData.append('faxNumber', this.companyForm.get('faxNumber')?.value);
    formData.append('website', this.companyForm.get('website')?.value);
    formData.append('registrationNumber', this.companyForm.get('registrationNumber')?.value);
    formData.append('countryId', this.companyForm.get('country')?.value);
    formData.append('industryId', this.companyForm.get('industry')?.value);
    formData.append('firstAddress', this.companyForm.get('firstAddress')?.value);
    formData.append('secondAddress', this.companyForm.get('secondAddress')?.value);
    formData.append('companyType', this.companyForm.get('companyType')?.value || 2);
    formData.append('employeesCount', this.companyForm.get('employeesCount')?.value);

    const apiCall = this.isEditMode
      ? this._apiCalling.putData("Company", "updateCompany/" + this.selectedCompany?.companyId, formData, true)
      : this._apiCalling.postData("Company", "addCompany", formData, true);

    apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this._dataShare.updateLoginStatus(true);
          this.goBack()
        } else {
          this._toaster.error(response?.message, 'Error!');
        }
      },
      error: (error) => {
        this._toaster.error("Internal server error occurred while processing your request")
      }
    });
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
