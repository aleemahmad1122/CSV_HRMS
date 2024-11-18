import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { EducationComponent } from '../components/education/education.component';
import { WorkHistoryComponent } from '../components/work-history/work-history.component';
import { AddEditComponent } from '../components/department-team/add-edit/add-edit.component';
import { ShiftHistoryComponent } from '../components/shift/shift-history.component';

@Component({
  selector: 'app-add-edit-module',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    EducationComponent,
    WorkHistoryComponent,
    AddEditComponent,
    ShiftHistoryComponent,
  ],
  templateUrl: './add-edit-module.component.html',
  styleUrls: ['./add-edit-module.component.css'],
})
export class AddEditModuleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode: boolean | string = false;
  isSubmitted = false;
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
    this.addEditForm = this.createForm();
  }

  ngOnInit(): void {
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
      employeeImage: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      role: ['', Validators.required],
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
        role: this.selectedValue.role,
      });
      this.imagePreview = this.selectedValue.imagePath || this.defaultImagePath;
    }
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
    if (this.addEditForm.invalid) {
      return;
    }

    // Create a FormData instance
    const formData = new FormData();

    // Append each form control's value to FormData
    Object.keys(this.addEditForm.controls).forEach((key) => {
      const value = this.addEditForm.get(key)?.value;
      if (key === 'employeeImage' && this.selectedFile) {
        formData.append(key, this.selectedFile); // Append file if selected
      } else {
        formData.append(key, value); // Append other form values
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
