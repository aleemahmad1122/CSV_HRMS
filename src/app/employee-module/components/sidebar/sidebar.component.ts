import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    RouterOutlet,
    DpDatePickerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {


  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };


  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode: boolean | string = false;
  id:string;
  isSubmitted = false;
  activRoute: string = '';

  faildToLoadImage:boolean = false;
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

  tabList: {
    path: string;
    name: string;
    class: string;
  }[] = [
      {
        name: 'language.generic.personalInfo',
        path: "/employee/profile/employee/edit",
        class: "fa-solid fa-user"
      },
      {
        name: 'language.employee.shift',
        path: "/employee/profile/shift/edit",
        class: "fa-solid fa-briefcase"
      },
      {
        name: 'language.employee.department',
        path: "/employee/profile/department-team/edit",
        class: "fa-solid fa-people-group"
      },
      {
        name: 'language.employee.education',
        path: "/employee/profile/education-history",
        class: "fa-sharp fa-solid fa-file-certificate"
      },
      {
        name: 'language.employee.workHistory',
        path: "/employee/profile/work-history",
        class: "fa-solid fa-briefcase"
      },
      {
        name: 'language.generic.changePass',
        path: "/employee/profile/change-password",
        class: "fa-solid fa-key"
      },
    ];

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

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const id = params['id'];
      this.isEditMode = id;
      this.id = id;
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
      firstName: ['',],
      lastName: ['',],
      email: ['' ],
      password: ['',],
      country: ['',],
      city: ['',],
      address: ['',],
      phoneNumber: ['',],
      role: ['',],
      joiningStatus: [true,],
      dateOfBirth: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`,],
      joiningDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`,],
      cnic: ['', Validators.required],
    });
  }

  private patchFormValues(): void {
    if(this.selectedValue.imagePath){

      this.defaultImagePath = this.selectedValue.imagePath
    }
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        firstName: this.selectedValue.firstName,
        lastName: this.selectedValue.lastName,
        email: this.selectedValue.email,
        password: this.selectedValue.password,
        country: this.selectedValue.country,
        city: this.selectedValue.city,
        address: this.selectedValue.address,
        phoneNumber: this.selectedValue.phoneNumber,
        cnic: this.selectedValue.cnic,
        joiningStatus: this.selectedValue.joiningStatus,
        dateOfBirth: this.convertToDatetimeLocalFormat(this.selectedValue.dateOfBirth),
        joiningDate: this.convertToDatetimeLocalFormat(this.selectedValue.joiningDate),
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
    this.imageSizeExceeded = false;
  }


  submitForm(): void {
    this.isSubmitted = true;

    // Create a FormData instance
    const formData = new FormData();

  formData.append('image', this.selectedFile);



    this.apiCalling.patchData('Employee', `uploadEmployeeImage`, formData, true,this.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toaster.success(response.message, 'Success!');
          this.defaultImagePath = response.data.imagePath
          this.removeImage()
        } else {
          this.toaster.error(response?.message || 'An error occurred', 'Error!');
        }
      },
      error: () => {
        this.toaster.error('An error occurred while processing your request. Please try again later.');
      },
    });
  }



}
