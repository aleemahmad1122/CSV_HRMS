import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../../environments/environment.prod';
import { NgSelectModule } from '@ng-select/ng-select';
import { LocalStorageManagerService } from '../../../shared/Services/local-storage-manager.service';

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

  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;


  empId: string = "";

  userReporting: {
    employeeId: string;
    fullName: string;
  }[] = []


  leaveType: {
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
    private _localStrong: LocalStorageManagerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.empId = this._localStrong.getEmployeeDetail()[0].employeeId;

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

    this.getUserReporting()
  }

  ngOnInit(): void {
    // this.getRemainingLeaves()
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

  // private getRemainingLeaves(): void {
  //   this.apiCalling.getData('Leave', 'getRemainingLeaves', true, { employeeId: this.id })
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res.success) {
  //           this.leaveType = res.data;
  //         } else {
  //           this.leaveType = []
  //         }
  //       },
  //       error: () => {
  //         this.leaveType = []
  //       },
  //     });
  // }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      loanReason: ['',Validators.required],
      amount: [null,[Validators.required,Validators.min(1)]],
      noOfInstallments: [null,Validators.required]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {

      this.addEditForm.patchValue({
        loanReason: this.selectedValue.loanReason,
        amount: this.selectedValue.amount,
        noOfInstallments: this.selectedValue.noOfInstallments,
      });
    }
  }

  // private convertToDatetimeLocalFormat(dateString: string): string {
  //   const date = new Date(dateString);
  //   return date.toISOString().split("T")[0]
  // }
  // onDateTimeChange(event: Event, valueName: string): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.value) {
  //     const formattedValue = this.convertToDatetimeLocalFormat(input.value);
  //     this.addEditForm.patchValue({ valueName: formattedValue });
  //   }
  // }
  // private formatDateForSubmission(dateString: string): string {
  //   const date = new Date(dateString);
  //   return date.toISOString();
  // }

  submitForm(): void {
    this.isSubmitted = true;

    if (this.addEditForm.invalid) {
      return;
    }

    const formValue = this.addEditForm.value;



    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Loan", `updateLoan/${this.isEditMode}`, formValue, true, this.id)
      : this.apiCalling.postData("Loan", "addLoan", formValue, true, this.id);

    apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toaster.success(response.message, 'Success!');
        } else {
          this.toaster.error(response?.message || 'An error occurred', 'Error!');
        }
      },
      error: (error) => {
        console.error('API error:', error);

      },
    });
  }

  onNumberInput(event: Event,name:string): void {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/[^0-9]/g, '');


      // Set the new value for the 'amount' field
      this.addEditForm.get(name)?.setValue(Number(input.value));
  }


  goBack(): void {
    this._router.navigate([window.history.back()]);
  }
}

