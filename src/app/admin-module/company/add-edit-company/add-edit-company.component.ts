import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ICompany } from "../../../types/index";
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidationErrors, ValidatorFn, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../../environments/environment.prod';
import {NgxIntlTelInputModule,CountryISO,SearchCountryField,PhoneNumberFormat} from "ngx-intl-tel-input"
import { NgSelectModule } from '@ng-select/ng-select';

interface Typess {
  typeId: string;
  typeName: string;
}

@Component({
  selector: 'app-add-edit-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TranslateModule, DpDatePickerModule, NgxIntlTelInputModule,NgSelectModule],
  templateUrl: './add-edit-company.component.html',
  styleUrl: './add-edit-company.component.css'
})

export class AddEditCompanyComponent implements OnInit, OnDestroy {
  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };
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
  searchCountryField: SearchCountryField[] = [SearchCountryField.Iso2];

  countries: { id: string; name: string }[] = Object.entries(CountryISO).map(([key, value]) => ({
    name: key,
    id: value
  }));

	separateDialCode = false;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.Pakistan, CountryISO.UnitedStates, CountryISO.UnitedKingdom];

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
      companyImage: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: new FormControl(undefined, [Validators.required]),
      faxNumber: [0],
      website: ['', Validators.required],
      registrationNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      country: [''],
      industry: ['', Validators.required],
      firstAddress: ['', Validators.required],
      secondAddress: [''],
      employeesCount: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      foundedDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, Validators.required],
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
        faxNumber: this.selectedCompany.faxNumber || 0,
        website: this.selectedCompany.website,
        registrationNumber: this.selectedCompany.registrationNumber,
        country: this.selectedCompany.countryId,
        industry: this.selectedCompany.industryId,
        firstAddress: this.selectedCompany.firstAddress,
        secondAddress: this.selectedCompany.secondAddress,
        offSet: this.selectedCompany.offSet,
        employeesCount: this.selectedCompany.employeesCount,
        foundedDate: this.convertToDatetimeLocalFormat(this.selectedCompany.foundedDate),
        companyType: this.selectedCompany.companyType || 2,
      });
      this.imagePreview = this.selectedCompany.companyImage || this.defaultImagePath
    }


  }

  private convertToDatetimeLocalFormat(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]
  }
  onDateTimeChange(event: Event, valueName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToDatetimeLocalFormat(input.value);
      this.companyForm.patchValue({ valueName: formattedValue });
    }
  }
  private formatDateForSubmission(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
  }

  submitForm() {
    this.companyForm.controls['phoneNumber'].touched
    const internationalNumber = this.companyForm.value.phoneNumber?.internationalNumber || '0';

    const countryCode = this.companyForm.value.phoneNumber?.countryCode || 'PK';

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
    formData.append('phoneNumber', internationalNumber);
    formData.append('faxNumber', this.companyForm.get('faxNumber')?.value || 0);
    formData.append('website', this.companyForm.get('website')?.value);
    formData.append('registrationNumber', this.companyForm.get('registrationNumber')?.value);
    formData.append('countryId',countryCode);
    formData.append('industryId', this.companyForm.get('industry')?.value);
    formData.append('foundedDate', this.formatDateForSubmission(this.companyForm.get('foundedDate')?.value));
    formData.append('firstAddress', this.companyForm.get('firstAddress')?.value);
    formData.append('secondAddress', this.companyForm.get('secondAddress')?.value);
    formData.append('companyType', this.companyForm.get('companyType')?.value || 2);
    formData.append('employeesCount', this.companyForm.get('employeesCount')?.value);
    formData.append('offSet', new Date().getTimezoneOffset().toString());
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
    window.history.back()
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
