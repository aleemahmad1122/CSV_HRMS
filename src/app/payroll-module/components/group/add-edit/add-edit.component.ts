import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { SalaryFrequencies,Salary } from '../../../../types';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule, NgSelectModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;
  frameworks: { value: number; name: string }[] = [{ value: 0, name: 'fixed' }, { value: 1, name: 'hourly' }];

  salaryFrequenciesList: SalaryFrequencies[];
  salaryComponent:Salary[]

  salaryType: {
    value: number;
    label: string;
  }[] = [
      {
        value: 0,
        label: "Deduction"
      },
      {
        value: 1,
        label: "Benefit"
      },
    ]



    calType:{
      label:string;
      value:number;
    }[] = [
      {
        label:"Fixed",
        value:0
      },
      {
        label:"Percentage",
        value:1
      },
    ]

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.addEditForm = this.createForm();
    this.getFrequency()
    this.getComponent()
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      this.isEditMode = id;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("Paygroup", `getPaygroupById/${id}`, true)
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
      } else {
        this.addRow();
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  private createPaygroupComponentsFormGroup(item): FormGroup {
    return this.fb.group({
      salaryId: [item.salaryId],
      salaryType: [item.salaryType],
      calculationType: [item.calculationType],
      amount: [item.amount]
    });
  }


  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      salaryFrequencyId: [null, Validators.required],
      paygroupType: [this.frameworks[0], Validators.required],
      description: [''],
      paygroupComponents: this.fb.array([])
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        title: this.selectedValue.title,
        paygroupType: this.selectedValue.paygroupType,
        description: this.selectedValue.description,
        salaryFrequencyId: this.selectedValue.salaryFrequencyId,
        paygroupComponents: this.selectedValue.paygroupComponents,
      });

      // Update shiftPolicies FormArray
      const paygroupFormArray = this.addEditForm.get('paygroupComponents') as FormArray;
      paygroupFormArray.clear(); // Clear existing items

      if (this.selectedValue.paygroupComponents?.length) {
        this.selectedValue.paygroupComponents.forEach(_ => {
          paygroupFormArray.push(this.createPaygroupComponentsFormGroup(_));
        });
      }


    }
  }

  private getFrequency(): void {

    try {
      this.apiCalling.getData("SalaryFrequency", `getSalaryFrequencies/`, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this.salaryFrequenciesList = response?.data?.salaryFrequencies;
            } else {
              this.salaryFrequenciesList = [];
            }
          },
          error: (error) => {
            this.salaryFrequenciesList = [];
          }
        });
    } catch (error) {
      console.log(error);

    }

  }

  private getComponent(): void {

    try {
      this.apiCalling.getData("Salary", `getSalaries/`, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this.salaryComponent = response?.data?.salaries;
            } else {
              this.salaryComponent = [];
            }
          },
          error: (error) => {
            this.salaryComponent = [];
          }
        });
    } catch (error) {
      console.log(error);

    }

  }

  submitForm(): void {

    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = this.addEditForm.value;
    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Paygroup", `updatePaygroup/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Paygroup", "addPaygroup", body, true);

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

      }
    });
  }

  onAmountInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    // Allow only digits in the input
    input.value = input.value.replace(/[^0-9]/g, '');

    // Check if the index is valid
    if (index >= 0 && index < this.paygroupComponents.length) {
      // Update the specific 'amount' field in the paygroupComponents array
      const paygroupArray = this.addEditForm.get('paygroupComponents') as FormArray;
      const component = paygroupArray.at(index) as FormGroup;

      // Set the new value for the 'amount' field
      component.get('amount')?.setValue(input.value);
    }
  }



  // table
  addRow() {
    const formData = this.fb.group({
      salaryId: ['', Validators.required],
      salaryType: [0, Validators.required],
      calculationType: [0, Validators.required],
      amount: ['', Validators.required],
    });
    this.paygroupComponents.push(formData);
  }

  get paygroupComponents(): FormArray {
    return this.addEditForm.controls["paygroupComponents"] as FormArray;
  }


  deleteRow(index: number): void {

    if (index >= 0 && index < this.paygroupComponents.length) {
      const updatedControls = this.paygroupComponents.controls.filter((_, i) => i !== index);
      this.addEditForm.setControl('paygroupComponents', this.fb.array(updatedControls));
    } else {
    }

  }


  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
