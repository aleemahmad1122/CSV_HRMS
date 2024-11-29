import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../../environments/environment.prod';

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
      startTime: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      endTime: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      graceMinutes: [0],
      earlyMinutes: [0],
      description: [''],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedAddEditValue) {
      this.addEditForm.patchValue({
        name: this.selectedAddEditValue.name,
        startTime: this.convertToTimeLocalFormat(this.selectedAddEditValue.startTime),
        endTime: this.convertToTimeLocalFormat(this.selectedAddEditValue.endTime),
        graceMinutes: this.selectedAddEditValue.graceMinutes,
        earlyMinutes: this.selectedAddEditValue.earlyMinutes,
        description: this.selectedAddEditValue.description,
        offSet: this.selectedAddEditValue.offSet,
      });
    }
  }


  private convertToTimeLocalFormat(dateString: string): string {
    const date = new Date(dateString); // Parse the input string into a Date object

    // Extract local time components
    const hours = date.getHours(); // Get the hour in local time
    const minutes = date.getMinutes(); // Get the minutes in local time
    const seconds = date.getSeconds(); // Get the seconds in local time

    // Format the time with leading zeros for consistency
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
  }


  datePickerConfig = {
    hour12: false,  // Use 24-hour format
    timePicker: true,  // Enable time picker
    format: environment.dateTimePatterns.time,  // Set the time format for the picker
  };


  onDateTimeChange(event: Event, valueName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToTimeLocalFormat(input.value);
      this.addEditForm.patchValue({ valueName: formattedValue });
    }
  }

  private formatDateForSubmission(timeString: string): string {
    // Split the timeString into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      hours < 0 || hours > 23 ||
      minutes < 0 || minutes > 59 ||
      seconds < 0 || seconds > 59
    ) {
      throw new Error("Invalid time format. Expected HH:mm:ss");
    }

    // Create a new Date object with today's date and the provided time
    const now = new Date();
    const localDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      seconds
    );

    // Return the ISO string in local time format, without fractional seconds and 'Z'
    return localDate.toISOString();
  }




  submitForm(): void {

    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }
    const formValue = this.addEditForm.value;
    const values = {
      ...formValue,
      startTime: this.formatDateForSubmission(formValue.startTime),
      endTime: this.formatDateForSubmission(formValue.endTime)
    };
    console.log(formValue);



    const body = { ...values };
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



