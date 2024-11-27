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

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {

  datePickerConfig = {
    format: 'YYYY-MM-DDTHH:mm',
  };

  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;

  leaveType: ILeaveType[]

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
    this.getLeaveTypes()
  }

  private getLeaveTypes(searchTerm = ''): void {
    this.apiCalling.getData('LeaveType', 'getLeaveTypes', true, { searchQuery: searchTerm })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ILeaveTypeRes) => {
          if (res.success) {
            this.leaveType = res.data.leaveType;
          } else {
            this.leaveType = [];
          }
        },
        error: () => {
          this.leaveType = [];
        },
      });
  }


  private convertToDatetimeLocalFormat(dateString: string): string {
    // Convert to 'yyyy-MM-ddTHH:mm' format for `datetime-local` input type
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);  // 'YYYY-MM-DDTHH:mm'
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToDatetimeLocalFormat(input.value); // Use the conversion function
      this.addEditForm.patchValue({ leaveDate: formattedValue });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      leaveTypeId: ['', [Validators.required]],
      leaveDate: ['', [Validators.required]],
      leaveReason: ['', [Validators.required]],
      offset: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {

      this.addEditForm.patchValue({
        leaveTypeId: this.selectedValue.leaveTypeId,
        leaveDate: this.convertToDatetimeLocalFormat(this.selectedValue.leaveDate),
        leaveReason: this.selectedValue.leaveReason,
        offset: this.selectedValue.offset,
      });
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const formValue = this.addEditForm.value;

    const payload = {
      ...formValue
    };



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
      }
    });
  }

  goBack(): void {
    this._router.navigate([window.history.back()]);
  }
}
