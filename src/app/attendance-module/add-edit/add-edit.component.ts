import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../environments/environment.prod';


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

  timePickerConfig = {
    hour12: true,  // Use 24-hour format
    timePicker: true,  // Enable time picker
    format: environment.dateTimePatterns.time,  // Set the time format for the picker
  };


  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;

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
        this.apiCalling.getData("Attendance", `getAttendanceById/${editId}`, true, { employeeId: this.id })
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

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      checkIn: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      checkOut: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      date: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      comment: [''],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        checkIn: this.convertToTimeLocalFormat(this.selectedValue.checkIn),
        checkOut: this.convertToTimeLocalFormat(this.selectedValue.checkOut),
        date: this.convertToDatetimeLocalFormat(this.selectedValue.date),
        comment: this.selectedValue.comment,
        offSet: this.selectedValue.offSet,
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
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return formattedTime;
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


  private formatTimeForSubmission(timeString: string): string {
    const [hours, minutes, seconds = 0] = timeString.split(':').map(Number); // Defaults seconds to 0
    if (
      isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
      hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59
    ) {
      throw new Error("Invalid time format. Expected HH:mm or HH:mm:ss");
    }
    const now = new Date();
    const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
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
      offSet: formValue.offSet,
      date: this.formatDateForSubmission(formValue.date),
      checkIn: this.formatTimeForSubmission(formValue.checkIn),
      checkOut: this.formatTimeForSubmission(formValue.checkOut)
    };



    const payload = { ...values };

    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Attendance", `updateAttendance/${this.isEditMode}`, payload, true, this.id)
      : this.apiCalling.postData("Attendance", "addAttendance", payload, true, this.id);

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

      }
    });
  }

  goBack(): void {
    this._router.navigate([window.history.back()]);
  }
}
