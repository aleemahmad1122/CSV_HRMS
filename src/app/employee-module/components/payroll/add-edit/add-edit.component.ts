import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule, NgSelectModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;
  editId: string;
  id: string;

  isViewMode: boolean = false;
  isAddMode: boolean = false;
  isCreate: boolean = false;
  isDelete: boolean = false;
  isEdit: boolean = false;
  permissions: { isAssign: boolean; permission: string }[] = [];

  typeList: {
    paygroupId: string;
    title: string;
  }[]
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id']
    });
    this.addEditForm = this.createForm();
    this.loadPermissions()
  }


  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const action = params.get('action');
      const id = this.route.snapshot.queryParams['id'];

      // Determine the mode based on the :action parameter
      this.isEditMode = action === 'edit';
      this.isViewMode = action === 'view';
      this.isAddMode = action === 'add';

      if (this.isEditMode || this.isViewMode) {
        this.loadEmployeeDesignation(id);
      }

      // Disable the form in view mode
      if (this.isViewMode) {
        this.addEditForm.disable();
      }
    });

    this.getGroupList()
  }


  private loadPermissions(): void {
    this.activatedRoute.data.subscribe(data => {
      const permissionsData = data['permission'];

      if (Array.isArray(permissionsData)) {

        this.permissions = permissionsData;
        this.isEdit = this.permissions.some(p => p.permission === "Edit_Employee_Payroll" && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === "Create_Employee_Payroll" && p.isAssign);
      } else {
        console.error("Invalid permissions format:", permissionsData);
      }
    });
  }


  private getGroupList(): void {
    try {
      this.apiCalling.getData("Paygroup", `getPaygroups`, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {

              this.typeList = response?.data?.paygroups;
              this.patchFormValues();
            } else {
              this.typeList = [];
            }
          },
          error: (error) => {
            this.typeList = [];
          }
        });
    } catch (error) {
      console.log(error);

    }
  }


  private loadEmployeeDesignation(id: string | null): void {
    if (id && isPlatformBrowser(this.platformId)) {
      this.apiCalling.getData("EmployeePayroll", `getEmployeePayroll`, true, { employeeId: this.id })
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              console.log(response.data.employeePayrollId);

              this.isEditMode = response.data.employeePayrollId != null;
              this.isAddMode = !this.isEditMode;
              this.selectedValue = response.data;
              this.patchFormValues();
            } else {
              this.isEditMode = false;
              this.isAddMode = true;
              this.selectedValue = null;
            }
          },
          error: () => {
            this.toaster.error('Error loading data', 'Error');
          }
        });
    }
  }


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      basicPay: ['', Validators.required],
      paygroupId: ['', Validators.required],
      description: [''],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        basicPay: this.selectedValue.basicPay,
        description: this.selectedValue.description,
        paygroupId: this.selectedValue.paygroupId,
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
      ? this.apiCalling.putData("EmployeePayroll", `updateEmployeePayroll/${this.selectedValue.employeePayrollId}`, body, true, this.id)
      : this.apiCalling.postData("EmployeePayroll", "addEmployeePayroll", body, true, this.id);

    apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toaster.success(response.message, 'Success!');

        } else {
          this.toaster.error(response?.message || 'An error occurred', 'Error!');
        }
      },
      error: (error) => {
        console.error('API error:', error);

      }
    });
  }

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
