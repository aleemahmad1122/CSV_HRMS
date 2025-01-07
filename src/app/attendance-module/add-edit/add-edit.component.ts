import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
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
    hour12: true,
    timePicker: true,
    format: environment.dateTimePatterns.time,
  };


  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;

  checkInDateEnabled: boolean;
  checkOutDateEnabled: boolean;

  checkInEnabled: boolean;
  checkOutEnabled: boolean;

  employeeAttendanceByDate?: {
    attendanceId: string;
    employeeId: string;
    attendanceDate: string;
    checkInDate: string;
    checkIn: string;
    checkOutDate: string;
    checkOut: string;
  } = undefined;


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
    this.addEditForm.get('date')?.valueChanges.subscribe(value => {
      this.addEditForm.patchValue({
          checkInDate: value // Update checkInDate whenever date changes
      });
  });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      checkIn: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`],
      checkOut: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`],
      date: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      checkInDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`],
      checkOutDate: [
        `${this.convertToDatetimeLocalFormat(environment.defaultDate)}`,
        [ this.checkOutDateValidator.bind(this)]
      ],
      comment: ['', Validators.required],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
  }

  private checkOutDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const checkInDate = this.addEditForm?.get('checkInDate')?.value;
    const checkOutDate = control.value;

    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      if (checkOut < checkIn) {
        return { minLengthCheckOutDate: true };
      }
    }
    return null;
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        checkIn: this.convertToTimeLocalFormat(this.selectedValue.checkIn),
        checkOut: this.convertToTimeLocalFormat(this.selectedValue.checkOut),
        date: this.convertToDatetimeLocalFormat(this.selectedValue.date),
        checkInDate:  this.addEditForm.value['date'],
        checkOutDate: this.convertToDatetimeLocalFormat(this.selectedValue.checkOutDate),
        comment: this.selectedValue.comment,
        offSet: this.selectedValue.offSet,
      });
    }
  }


  private convertToTimeLocalFormat(dateString: string): string {
    const date = new Date(dateString);

    // Convert to 12-hour format
    let hours = date.getHours();
    const minutes = date.getMinutes();

    // Convert 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, set to 12

    // Format with leading zeros for minutes only
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${date.getHours() > 11 ? 'PM' : 'AM'}`;

    return formattedTime;
  }
  private convertToDatetimeLocalFormat(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]
  }
  onDateTimeChange(event: any, valueName: string): void {

console.log(this.addEditForm);


    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToDatetimeLocalFormat(input.value);
      this.addEditForm.patchValue({ [valueName]: formattedValue });

      // Validate check-out time whenever related fields change
      if (['checkIn', 'checkOut', 'checkInDate', 'checkOutDate'].includes(valueName)) {
        this.validateCheckOutTime();
      }
    }
  }

  getEmpAttByDate(): void {
    if (!this.addEditForm.get('date')?.value) {
      return;
    }

    this.apiCalling.getData("Attendance", `getEmployeeAttendanceByDate`, true,
      { employeeId: this.id, date: this.addEditForm.value['date'] })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.employeeAttendanceByDate = response?.data;
          } else {
            this.employeeAttendanceByDate = undefined;
            this.toaster.info(response.message);
          }
          // Call these after setting employeeAttendanceByDate
          this.isCheckInDateEnabled();
          this.isCheckOutDateEnabled();
          this.isCheckInEnabled();
          this.isCheckOutEnabled();
        },
        error: (error) => {
          this.employeeAttendanceByDate = undefined;
          this.isCheckInDateEnabled();
          this.isCheckOutDateEnabled();
          this.isCheckInEnabled();
          this.isCheckOutEnabled();
        }
      });
  }

  private formatDateForSubmission(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString(); // This will return the date in 'YYYY-MM-DDTHH:mm:ss.sssZ' format
  }


  private formatTimeForSubmission(date: string, time: string): string | void {
    let dateTime = `${date} ${time}`
    return new Date(
      new Date(dateTime).getFullYear(), new Date(dateTime).getMonth(), new Date(dateTime).getDate(),
      new Date(dateTime).getHours(), new Date(dateTime).getMinutes(), new Date(dateTime).getSeconds()).toISOString()

    // if (timeString) {
    //   const [hours, minutes, seconds = 0] = timeString.split(':').map(Number); // Defaults seconds to 0
    //   if (
    //     isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
    //     hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59
    //   ) {
    //     throw new Error("Invalid time format. Expected HH:mm or HH:mm:ss");
    //   }
    //   const now = new Date();
    //   const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
    //   return localDate.toISOString();
    // }
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
      checkInDate: this.formatDateForSubmission(formValue.date),
      checkIn: this.formatTimeForSubmission(formValue.checkInDate, formValue.checkIn),
      checkOut: this.formatTimeForSubmission(formValue.checkOutDate, formValue.checkOut)
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

  isCheckInDateEnabled(): void {
    // this.checkInDateEnabled = !(!this.employeeAttendanceByDate?.checkInDate);
    this.checkInDateEnabled = true;
  }

  isCheckOutDateEnabled(): void {
    this.checkOutDateEnabled = !(!this.employeeAttendanceByDate?.checkOutDate);
  }

  isCheckInEnabled(): void {
    this.checkInEnabled = !(!this.employeeAttendanceByDate?.checkIn);
  }

  isCheckOutEnabled(): void {
    this.checkOutEnabled = !(!this.employeeAttendanceByDate?.checkOut);
  }

  validateCheckOutTime(): void {
    const checkInDate = new Date(this.addEditForm.get('checkInDate')?.value);
    const checkInTime = this.addEditForm.get('checkIn')?.value;
    const checkOutDate = new Date(this.addEditForm.get('checkOutDate')?.value);
    const checkOutTime = this.addEditForm.get('checkOut')?.value;

    if (checkInDate && checkInTime && checkOutDate && checkOutTime) {
      const [checkInHours, checkInMinutes] = checkInTime.split(':');
      const [checkOutHours, checkOutMinutes] = checkOutTime.split(':');

      const fullCheckInDate = new Date(checkInDate.setHours(checkInHours, checkInMinutes));
      const fullCheckOutDate = new Date(checkOutDate.setHours(checkOutHours, checkOutMinutes));

      if (fullCheckOutDate <= fullCheckInDate) {
        this.addEditForm.get('checkOut')?.setErrors({ invalidCheckOut: true });
        this.addEditForm.get('checkOutDate')?.setErrors({ invalidCheckOut: true });
      }
    }
  }
}
