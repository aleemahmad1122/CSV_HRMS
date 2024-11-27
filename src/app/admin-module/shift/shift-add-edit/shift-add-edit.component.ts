import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';

@Component({
  selector: 'app-shift-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule],
  templateUrl: './shift-add-edit.component.html',
  styleUrl: './shift-add-edit.component.css'
})
export class ShiftAddEditComponent implements OnInit, OnDestroy {


  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedAddEditValue: any;

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
        this.apiCalling.getData("Shift", `getShiftById/${id}`, true)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedAddEditValue = response?.data;
                this.patchFormValues();
              } else {
                this.selectedAddEditValue = [];
              }
            },
            error: (error) => {
              this.selectedAddEditValue = [];
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
      name: ['', [Validators.required, Validators.maxLength(100)]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      graceMinutes: [0],
      earlyMinutes: [0],
      description: [''],
      offset: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedAddEditValue) {
      this.addEditForm.patchValue({
        name: this.selectedAddEditValue.name,
        startTime: this.selectedAddEditValue.startTime,
        endTime: this.selectedAddEditValue.endTime,
        graceMinutes: this.selectedAddEditValue.graceMinutes,
        earlyMinutes: this.selectedAddEditValue.earlyMinutes,
        description: this.selectedAddEditValue.description,
        offset: this.selectedAddEditValue.offset,
      });
    }
  }


  // Converts the selected date/time into the format 'yyyy-MM-ddTHH:mm'
  private convertToTimeLocalFormat(dateString: string): string {
    const date = new Date(dateString);

    // Ensure that the time is formatted as `HH:mm` and in the 'yyyy-MM-ddTHH:mm' format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Month is zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Return formatted date as `yyyy-MM-ddTHH:mm`
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onStartTimeChange(event: any): void {
    const inputValue = event.target.value;

    if (inputValue) {
      // Convert the selected time into the desired format
      const formattedValue = this.convertToTimeLocalFormat(inputValue);

      // Update the form control with the formatted value
      this.addEditForm.patchValue({ startTime: formattedValue });
    }
  }

  onEndTimeChange(event: any): void {
    const inputValue = event.target.value;

    if (inputValue) {
      // Convert the selected time into the desired format
      const formattedValue = this.convertToTimeLocalFormat(inputValue);

      // Update the form control with the formatted value
      this.addEditForm.patchValue({ endTime: formattedValue });
    }
  }

  // Date picker configuration to support 24-hour format and time selection
  datePickerConfig = {
    hour12: false,  // Use 24-hour format
    timePicker: true,  // Enable time picker
    format: 'HH:mm',  // Set the time format for the picker
  };


  submitForm(): void {
    console.log(this.addEditForm.value);

    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = this.addEditForm.value;
    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Shift", `updateShift/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Shift", "addShift", body, true);

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
    this.router.navigate(['/admin/shift']);
  }
}



