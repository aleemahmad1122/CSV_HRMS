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
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-shift-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule, NgSelectModule],
  templateUrl: './shift-add-edit.component.html',
  styleUrl: './shift-add-edit.component.css'
})
export class ShiftAddEditComponent implements OnInit, OnDestroy {

  week: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  selectedDays: string[] = [];

  shiftStartsFromPreviousDayOpt: { value: boolean; label: string; }[] = [
    {
      value: false,
      label: "No"
    },
    {
      value: true,
      label: "Yes"
    },
  ]


  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedAddEditValue: any;

  selectedStartTime: Date | null = null;

  timeList: number[] = [5, 10, 15, 20, 25, 30,]

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
      shiftCode: ['01', [Validators.required]],
      shiftName: ['', [Validators.required, Validators.maxLength(100)]],
      workingDays: ['', [Validators.required]],
      startTime: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      endTime: [`${this.convertToTimeLocalFormat(environment.defaultDate)}`, [Validators.required]],
      description: [''],
      offSet: [new Date().getTimezoneOffset().toString()],
      shiftStartsFromPreviousDay: [false, Validators.required],
      shiftEndsFromPreviousDay: [false, Validators.required],
      policies: []
    });
  }

  private patchFormValues(): void {
    if (this.selectedAddEditValue) {
      this.addEditForm.patchValue({
        shiftName: this.selectedAddEditValue.shiftName,
        workingDays: this.selectedAddEditValue.workingDays,
        startTime: this.convertToTimeLocalFormat(this.selectedAddEditValue.startTime),
        endTime: this.convertToTimeLocalFormat(this.selectedAddEditValue.endTime),
        description: this.selectedAddEditValue.description,
        offSet: this.selectedAddEditValue.offSet,
        shiftStartsFromPreviousDay: this.selectedAddEditValue.shiftStartsFromPreviousDay,
        shiftEndsFromPreviousDay: this.selectedAddEditValue.shiftEndsFromPreviousDay,
        policies: this.selectedAddEditValue.policies,
      });
      if (this.selectedAddEditValue.workingDays) {
        this.selectedDays = this.selectedAddEditValue.workingDays.split(',').map(day => day.trim());
      }

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


  datePickerConfig = {
    hour12: true,
    timePicker: true,
    showSeconds: false,
    format: environment.dateTimePatterns.time,
  };


  onDayChange(day: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter((d) => d !== day);
    }

    // Update the form control with the comma-separated string
    this.addEditForm.get('workingDays')?.setValue(this.selectedDays.join(','));
  }


  onDateTimeChange(event: Event, valueName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToTimeLocalFormat(input.value);
      this.addEditForm.patchValue({ valueName: formattedValue });
    }
  }

  private formatDateForSubmission(timeString: string): string {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let adjustedHours = hours;
    if (period === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'AM' && hours === 12) {
      adjustedHours = 0;
    }

    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      adjustedHours,
      minutes
    );

    return date.toISOString();
  }




  submitForm(): void {
    console.log(this.addEditForm.value);

    // this.isSubmitted = true;
    // if (this.addEditForm.invalid) {
    //   return;
    // }
    // const formValue = this.addEditForm.value;
    // const values = {
    //   ...formValue,
    //   workingDays: this.selectedDays.join(','),
    //   startTime: this.formatDateForSubmission(formValue.startTime),
    //   endTime: this.formatDateForSubmission(formValue.endTime)
    // };



    // const body = { ...values };

    // const apiCall = this.isEditMode
    //   ? this.apiCalling.putData("Shift", `updateShift/${this.isEditMode}`, body, true)
    //   : this.apiCalling.postData("Shift", "addShift", body, true);

    // apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
    //   next: (response) => {
    //     if (response?.success) {
    //       this.toaster.success(response.message, 'Success!');
    //       this.goBack();
    //     } else {
    //       this.toaster.error(response?.message || 'An error occurred', 'Error!');
    //     }
    //   },
    //   error: (error) => {
    //     console.error('API error:', error);

    //   }
    // });
  }

  goBack(): void {
    this.router.navigate(['/admin/shift']);
  }
}



