import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';

import { DeactivatedComponent } from "../components/deactivated/deactivated.component";
import { EducationComponent } from "../components/education/education.component";
import { WorkHistoryComponent } from "../components/work-history/work-history.component";

@Component({
  selector: 'app-add-edit-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,DeactivatedComponent,EducationComponent,WorkHistoryComponent],
  templateUrl: './add-edit-module.component.html',
  styleUrl: './add-edit-module.component.css'
})
export class AddEditModuleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  isView:boolean = false;
  selectedValue: any;


  tabList:string[] = ["language.sidebar.employee","language.employee.workHistory","language.employee.education","language.employee.deactivated",]
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
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      this.isEditMode = id;
      const view = params['view'];
      this.isView = view === 'true';
console.log( view === 'true');

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("Employee", `getEmployeeById/${id}`, true)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedValue = response?.data;
                this.patchFormValues();
              } else {
                this.selectedValue = [];
              }
            },
            error: (error) => {
              this.selectedValue = [];
            }
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
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        employeeImage: this.selectedValue.employeeImage,
        fullName: this.selectedValue.fullName,
        email: this.selectedValue.email,
        password: this.selectedValue.password,
        country: this.selectedValue.country,
        city: this.selectedValue.city,
        address: this.selectedValue.address,
        phoneNumber: this.selectedValue.phoneNumber,
        role: this.selectedValue.role
      });
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = this.addEditForm.value;
    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Employee", `updateEmployee/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Employee", "addEmployee", body, true);

    apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toaster.success(response.message, 'Success!');
          this.goBack();
        } else {
          this.toaster.error(response?.message || 'An error occurred', 'Error!');
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.toaster.error("An error occurred while processing your request. Please try again later.");
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employee/job-detail']);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
