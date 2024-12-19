import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { ILeaveType, ILeaveTypeRes } from '../../../types';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };

  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;


  leaveType:  {
    leaveTypeId: string;
    leaveTypeName: string;
    remainingLeaves: number;
  }[]

  id: string;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.id = params['id'];
      const editId = params['editId'];
      this.isEditMode = editId;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("Leave", `getLeaveById/${editId}`, true, { employeeId: this.id })
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedValue = response?.data;
                this.patchFormValues(); // Call patchFormValues here after setting selectedValue
              } else {
                this.selectedValue = [];
              }
            },
            error: (error) => {
              this.selectedValue = [];
            }
          });
        // this.patchFormValues(); // Removed this line
      }
    });
    this.addEditForm = this.createForm();


  }

  ngOnInit(): void {
    this.getRemainingLeaves()
  }



  private getRemainingLeaves(): void {
    this.apiCalling.getData('Leave', 'getRemainingLeaves', true, { employeeId: this.id })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.leaveType = res.data;
          } else {
            this.leaveType = []
          }
        },
        error: () => {
          this.leaveType = []
        },
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      leaveTypeId: ['', [Validators.required]],
      leaveFrom: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      leaveTo: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      leaveReason: [''],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {

      this.addEditForm.patchValue({
        leaveTypeId: this.selectedValue.leaveTypeId,
        leaveFrom: this.convertToDatetimeLocalFormat(this.selectedValue.leaveFrom),
        leaveTo: this.convertToDatetimeLocalFormat(this.selectedValue.leaveTo),
        leaveReason: this.selectedValue.leaveReason,
        offSet: this.selectedValue.offSet,
      });
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

  submitForm(): void {
    this.isSubmitted = true;

    if (this.addEditForm.invalid) {
      return;
    }

    const formValue = this.addEditForm.value;

    // Parse dates and calculate duration of leave
    const leaveFrom = new Date(formValue.leaveFrom);
    const leaveTo = new Date(formValue.leaveTo);
    const leaveDuration = (leaveTo.getTime() - leaveFrom.getTime()) / (1000 * 60 * 60 * 24) + 1; // Including the start day

    // Check if leaveFrom is earlier than leaveTo
    if (leaveFrom > leaveTo) {
      this.toaster.error('The "Leave From" date must be earlier than or equal to the "Leave To" date.', 'Invalid Date Range');
      return;
    }

    // Check if the selected leave type has sufficient remaining leaves
    const selectedLeaveType = this.leaveType.find(type => type.leaveTypeId === formValue.leaveTypeId);
    if (selectedLeaveType && leaveDuration > selectedLeaveType.remainingLeaves) {
      this.toaster.error(`You only have ${selectedLeaveType.remainingLeaves} remaining leaves for this leave type.`, 'Insufficient Leaves');
      return;
    }

    const values = {
      ...formValue,
      leaveFrom: this.formatDateForSubmission(formValue.leaveFrom),
      leaveTo: this.formatDateForSubmission(formValue.leaveTo),
    };

    const payload = { ...values };

    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Leave", `updateLeave/${this.isEditMode}`, payload, true, this.id)
      : this.apiCalling.postData("Leave", "addLeave", payload, true, this.id);

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
      },
    });
  }


  goBack(): void {
    this._router.navigate([window.history.back()]);
  }
}
