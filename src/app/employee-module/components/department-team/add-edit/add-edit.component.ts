import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiCallingService } from './../../../../shared/Services/api-calling.service';
import { IDepartmentRes, IDepartment, ITeam, IDesignations, IDesignationRes, ITeamRes, IReportTo } from '../../../../types';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  departmentList: IDepartment[] = [];
  teamList: ITeam[] = [];
  reportList: IReportTo[] = [];
  designationList: IDesignations[] = [];
  addEditForm: FormGroup;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  isAddMode: boolean = false;
  isSubmitted = false;
  selectedValue: any;
  id: string = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id']
    });
    this.addEditForm = this.createForm();
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

    this.getDepartments();
    this.getDesignations();
    this.getTeams();
    this.getSeniorEmployees();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private loadEmployeeDesignation(id: string | null): void {
    if (id && isPlatformBrowser(this.platformId)) {
      this.apiCalling.getData("EmployeeDesignation", `getEmployeeDesignation`, true, { employeeId: this.id })
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this.isEditMode = response.data.employeeDesignationId != null;
              this.isAddMode = !this.isEditMode;
              this.selectedValue = response.data;
              this.patchFormValues();
            } else {
              this.isEditMode = false;
              this.isAddMode = true;
              this.selectedValue = null;
              this.toaster.info(response.data, '');
            }
          },
          error: () => {
            this.toaster.error('Error loading data', 'Error');
          }
        });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      departmentId: ['', Validators.required],
      designationId: ['', Validators.required],
      teamId: ['', Validators.required],
      reportsTo: ['', Validators.required],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        departmentId: this.selectedValue.departmentId,
        designationId: this.selectedValue.designationId,
        teamId: this.selectedValue.teamId,
        reportsTo: this.selectedValue.reportsTo
      });
    }
  }

  getDepartments(): void {
    this.apiCalling.getData('Department', 'getDepartments', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IDepartmentRes) => this.departmentList = res.data.departments,
        error: () => this.toaster.error('Failed to load departments', 'Error'),
      });
  }

  getDesignations(): void {
    this.apiCalling.getData('Designation', 'getDesignations', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IDesignationRes) => this.designationList = res.data.designations,
        error: () => this.toaster.error('Failed to load designations', 'Error'),
      });
  }

  getTeams(): void {
    this.apiCalling.getData('Team', 'getTeams', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ITeamRes) => this.teamList = res.data.teams,
        error: () => this.toaster.error('Failed to load teams', 'Error'),
      });
  }

  getSeniorEmployees(): void {
    this.apiCalling.getData('Employee', 'getSeniorEmployees', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => this.reportList = res.data,
        error: () => this.toaster.error('Failed to load teams', 'Error'),
      });
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = this.addEditForm.value;
    const apiCall = this.isEditMode
      ? this.apiCalling.putData("EmployeeDesignation", `updateEmployeeDesignation/${this.selectedValue.employeeDesignationId}`, body, true, this.id)
      : this.apiCalling.postData("EmployeeDesignation", "addEmployeeDesignation", body, true, this.id);

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
        this.toaster.error('An error occurred while processing your request', 'Error');
      }
    });
  }

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
