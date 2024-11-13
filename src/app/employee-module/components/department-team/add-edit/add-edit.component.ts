import { ApiCallingService } from './../../../../shared/Services/api-calling.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { IDepartmentRes, IDepartment, ITeam, IDesignations, IDesignationRes, ITeamRes } from '../../../../types';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent {
  private ngUnsubscribe = new Subject<void>();
  departmentList: IDepartment[] = []
  teamList: ITeam[] = []
  designationList: IDesignations[] = []
  addEditForm: FormGroup;
  isEditMode: boolean | string = false;
  isSubmitted = false;
  selectedValue: any;

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

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("EmployeeDesignation", `getEmployeeDesignationById/${id}`, true)
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

    this.getDepartments();
    this.getDesignations();
    this.getTeams();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDepartments(): void {
    this.apiCalling.getData('Department', 'getDepartments', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IDepartmentRes) => this.departmentList = res.data.departments,
        error: () => ([]),
      });
  }

  getDesignations(): void {
    this.apiCalling.getData('Designation', 'getDesignations', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IDesignationRes) => this.designationList = res.data.designations,
        error: () => ([]),
      });
  }

  getTeams(): void {
    this.apiCalling.getData('Team', 'getTeams', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ITeamRes) => this.teamList = res.data.teams,
        error: () => ([]),
      });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      departmentId: ['', Validators.required],
      designationId: ['', Validators.required],
      teamId: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        departmentId: this.selectedValue.departmentId,
        designationId: this.selectedValue.designationId,
        teamId: this.selectedValue.teamId,
        description: this.selectedValue.description
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
      ? this.apiCalling.putData("EmployeeDesignation", `updateEmployeeDesignation/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("EmployeeDesignation", "addEmployeeDesignation", body, true);

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
    this.router.navigate(['/admin/clients']);
  }
}
