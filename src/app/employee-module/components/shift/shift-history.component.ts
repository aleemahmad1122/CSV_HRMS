import { ToastrService } from 'ngx-toastr';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { IEmployeeShift, IEmployeeShiftRes, IShift, IShiftRes } from '../../../types/index';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConvertTimePipe } from '../../../shared/pipes/convert-time.pipe';

@Component({
  selector: 'app-shift-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,ConvertTimePipe],
  templateUrl: './shift-history.component.html',
  styleUrl: './shift-history.component.css'
})
export class ShiftHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  employeeShifList: IEmployeeShift[] = [];
  shiftList: IShift[] = [];
  addEditForm: FormGroup;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  isAddMode: boolean = false;
  isSubmitted = false;
  selectedValue: any;
  id: string = "";


  permissions: { isAssign: boolean; permission: string }[] = [];
  isEdit: boolean = false;
  isCreate: boolean = false;
  isDelete: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.loadPermissions();
    this.route.queryParams.subscribe(params => {
      this.id = params['id']
    });
    this.addEditForm = this.createForm();
  }



  private loadPermissions(): void {
    this.activatedRoute.data.subscribe(data => {
      const permissionsData = data['permission'];
      if (Array.isArray(permissionsData)) {
        this.permissions = permissionsData;
        this.isEdit = this.permissions.some(p => p.permission === 'Edit_Employee_Shift' && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === 'Create_Employee_Shift' && p.isAssign);
      } else {
        console.error("Invalid permissions format:", permissionsData);
      }
    });
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
        this.loadEmployeeShift(id);
      }

      // Disable the form in view mode
      if (this.isViewMode) {
        this.addEditForm.disable();
      }
    });
    this.getShifts();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getShifts(): void {
    this.apiCalling.getData('Shift', 'getShifts', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IShiftRes) => this.shiftList = res.data.shifts,
        error: () => this.toaster.error('Failed to load departments', 'Error'),
      });
  }

  getShiftName(shiftId: string): string {
    const shift = this.shiftList.find((shift) => shift.shiftId === shiftId);
    return shift ? shift.name : '';
  }

  private loadEmployeeShift(id: string | null): void {
    if (id && isPlatformBrowser(this.platformId)) {
      this.apiCalling.getData('EmployeeShift', 'getEmployeeShift', true, { employeeId: this.id })
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this.isEditMode = response.data.employeeShiftId != null;
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

  private createForm(): FormGroup {
    return this.fb.group({
      shiftId: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        shiftId: this.selectedValue.shiftId,
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
      ? this.apiCalling.putData("EmployeeShift", `updateEmployeeShift/${this.selectedValue.employeeShiftId}`, body, true, this.id)
      : this.apiCalling.postData("EmployeeShift", "addEmployeeShift", body, true, this.id);

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
