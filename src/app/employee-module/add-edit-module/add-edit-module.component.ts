import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { EducationComponent } from '../components/education/education.component';
import { WorkHistoryComponent } from '../components/work-history/work-history.component';
import { AddEditComponent } from '../components/department-team/add-edit/add-edit.component';
import { ShiftHistoryComponent } from '../components/shift/shift-history.component';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-add-edit-module',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    EducationComponent,
    WorkHistoryComponent,
    AddEditComponent,
    DpDatePickerModule,
    ShiftHistoryComponent,
  ],
  templateUrl: './add-edit-module.component.html',
  styleUrls: ['./add-edit-module.component.css'],
})
export class AddEditModuleComponent implements OnInit, OnDestroy {


  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };


  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode: boolean | string = false;
  isSubmitted = false;
  activRoute: string = '';
  rolesList: {
    roleId: string;
    name: string;
    isActive: boolean;
  }[

  ] = []

  isView: boolean = false;
  selectedValue: any;
  defaultImagePath =
    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded = false;

  readonly maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
  allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  tabList: string[] = [
    'language.sidebar.employee',
    'language.employee.shift',
    'language.employee.department',
    'language.employee.education',
    'language.employee.workHistory',
  ];
  activeTab: string = this.tabList[0];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,

    @Inject(PLATFORM_ID) private platformId: Object
  ) {



    this.router.events.subscribe(() => {
      this.activRoute = this.router.url;
    });
    this.addEditForm = this.createForm();
  }

  private getRoles(): void {
    this.apiCalling
      .getData('Role', `getRoles`, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response) {
            this.rolesList = response?.data?.roles;
            this.patchFormValues();
          } else {
            this.rolesList = [];
          }
        },
        error: () => {
          this.rolesList = [];
        },
      });
  }

  ngOnInit(): void {
    this.getRoles()
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const id = params['id'];
      this.isEditMode = id;
      const view = params['view'];
      this.isView = view === 'true';

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling
          .getData('Employee', `getEmployeeById/${id}`, true)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedValue = response?.data;
                this.patchFormValues();
              } else {
                this.selectedValue = [];
              }
            },
            error: () => {
              this.selectedValue = [];
            },
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      employeeImage: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      role: ['', Validators.required],
      dateOfBirth: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, Validators.required],
      cnic: ['', Validators.required],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        employeeImage: this.selectedValue.employeeImage,
        firstName: this.selectedValue.firstName,
        lastName: this.selectedValue.lastName,
        email: this.selectedValue.email,
        password: this.selectedValue.password,
        country: this.selectedValue.country,
        city: this.selectedValue.city,
        address: this.selectedValue.address,
        phoneNumber: this.selectedValue.phoneNumber,
        cnic: this.selectedValue.cnic,
        dateOfBirth: this.convertToDatetimeLocalFormat(this.selectedValue.dateOfBirth),
        role: this.selectedValue.role,
      });
      this.imagePreview = this.selectedValue.imagePath || this.defaultImagePath;
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
      this.addEditForm.patchValue({ valueName: formattedValue });
    }
  }

  private formatDateForSubmission(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString(); // This will return the date in 'YYYY-MM-DDTHH:mm:ss.sssZ' format
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!this.allowedFileTypes.includes(file.type)) {
        this.toaster.error('Invalid file type. Please select a PNG, JPG, or JPEG file.');
        return;
      }

      if (file.size > this.maxSizeInBytes) {
        this.toaster.error('File size exceeds 1 MB. Please select a smaller file.');
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



  submitForm(): void {
    this.isSubmitted = true;
    console.log(this.addEditForm.invalid);

    if (this.addEditForm.invalid) {
      return;
    }

    // Create a FormData instance
    const formData = new FormData();

    Object.keys(this.addEditForm.controls).forEach((key) => {
      const value = this.addEditForm.get(key)?.value;

      if (key === 'dob') {
        // Append the formatted date for 'dob'
        formData.append(key, this.formatDateForSubmission(value));
      } else if (key === 'employeeImage' && this.selectedFile) {
        // Append file if 'employeeImage' is the key and file is selected
        formData.append(key, this.selectedFile);
      } else {
        // Append other form control values
        formData.append(key, value ?? ''); // Ensure no null/undefined values are appended
      }
    });


    // Determine API call based on mode
    const apiCall = this.isEditMode
      ? this.apiCalling.putData('Employee', `updateEmployee/${this.isEditMode}`, formData, true)
      : this.apiCalling.postData('Employee', 'addEmployee', formData, true);

    // Execute the API call
    apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toaster.success(response.message, 'Success!');
          this.goBack();
        } else {
          this.toaster.error(response?.message || 'An error occurred', 'Error!');
        }
      },
      error: () => {
        this.toaster.error('An error occurred while processing your request. Please try again later.');
      },
    });
  }


  goBack(): void {
    this.router.navigate(['/employee/employee-list']);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
