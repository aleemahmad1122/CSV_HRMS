import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../environments/environment.prod';
import { NgSelectModule } from '@ng-select/ng-select';
import { LocalStorageManagerService } from '../../shared/Services/local-storage-manager.service';


@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule, NgSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };



  empId: string = "";

  userReporting: {
    employeeId: string;
    fullName: string;
  }[] = []


  timePickerConfig = {
    hour12: true,
    timePicker: true,
    format: environment.dateTimePatterns.time,
  };


  types: { name: string; value: number; }[] = [
    { name: "Missing Attendance", value: 1 },
    { name: "Remote Request", value: 2 }
  ];


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
    private _localStrong: LocalStorageManagerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {


    this.empId = this._localStrong.getEmployeeDetail()[0].employeeId;

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.id = params['id'];
      const editId = params['editId'];
      this.isEditMode = editId;

      if (this.isEditMode) {
        this.apiCalling.getData("Attendance", `getAttendanceById/${editId}`, true, { employeeId: this.id })
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                console.log(response);

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
        this.patchFormValues();
      }
    });
    this.addEditForm = this.createForm();


    this.getUserReporting()
  }

  ngOnInit(): void {
    this.addEditForm.get('date')?.valueChanges.subscribe(value => {
      this.addEditForm.patchValue({
        checkInDate: value
      });
    });
  }



  onUserSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.id = selectElement.value;
  }


  getUserReporting(): void {
    this.apiCalling
      .getData('Attendance', 'getUserReportings', true, {
        employeeId: this.empId
      })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.userReporting = response.data;
          } else {
            this.userReporting = []; // Handle case when response is not successful
          }
        },
        error: () => {
          this.userReporting = []; // Handle error scenario
        },
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
      attendanceRequestType: 1,
      checkOutDate: [
        `${this.convertToDatetimeLocalFormat(environment.defaultDate)}`,
        [this.checkOutDateValidator.bind(this)]
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
    console.log("fdfd",this.selectedValue);

    if (this.selectedValue) {
      this.addEditForm.patchValue({
        checkIn: this.selectedValue.checkIn && this.convertToTimeLocalFormat(this.selectedValue.checkIn),
        checkOut: this.selectedValue.checkOut && this.convertToTimeLocalFormat(this.selectedValue.checkOut),
        date: this.selectedValue.date && this.convertToDatetimeLocalFormat(this.selectedValue.date),
        checkInDate: this.addEditForm.value['date'],
        checkOutDate: this.selectedValue.checkOutDate && this.convertToDatetimeLocalFormat(this.selectedValue.checkOutDate),
        comment: this.selectedValue.comment,
        attendanceRequestType: this.selectedValue.attendanceRequestType,
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

    // Format with leading zeros for hours and minutes
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

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
      this.addEditForm.patchValue({ [valueName]: formattedValue });

      this.validateCheckOutTime();
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
          this.toaster.error(response?.message + ' ' + response?.data || 'An error occurred', 'Error!');
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
    this.checkOutDateEnabled = !(!this.employeeAttendanceByDate?.checkOutDate) && !this.isEditMode;
  }

  isCheckInEnabled(): void {
    this.checkInEnabled = !(!this.employeeAttendanceByDate?.checkIn) && !this.isEditMode;
  }

  isCheckOutEnabled(): void {
    this.checkOutEnabled = !(!this.employeeAttendanceByDate?.checkOut) && !this.isEditMode;
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
