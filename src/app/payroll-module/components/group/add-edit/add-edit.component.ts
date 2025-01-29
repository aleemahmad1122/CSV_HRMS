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
  salaryComponentDeduction:Salary[]
  salaryComponentBenefit:Salary[]

  salaryType: {
    value: number;
    label: string;
  }[] = [
      {
        value: 2,
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
    this.getComponentForDeduction()
    this.getComponentForBenefit()
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
        this.addRowBenefit();
        this.addRowDeduction();
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  private createpaygroupComponentsBenefitFormGroup(item): FormGroup {
    return this.fb.group({
      salaryId: [item.salaryId],
      salaryType: [item.salaryType],
      calculationType: [item.calculationType],
      amount: [item.amount]
    });
  }



  private createpaygroupComponentsDeductionFormGroup(item): FormGroup {
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
      paygroupComponentsBenefit: this.fb.array([]),
      paygroupComponentsDeduction: this.fb.array([])
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        title: this.selectedValue.title,
        paygroupType: this.selectedValue.paygroupType,
        description: this.selectedValue.description,
        salaryFrequencyId: this.selectedValue.salaryFrequencyId,
        paygroupComponentsBenefit: this.selectedValue.paygroupComponentsBenefit,
      });

      // Update shiftPolicies FormArray
      const paygroupFormArray = this.addEditForm.get('paygroupComponentsBenefit') as FormArray;
      paygroupFormArray.clear(); // Clear existing items

      if (this.selectedValue.paygroupComponentsBenefit?.length) {
        this.selectedValue.paygroupComponentsBenefit.forEach(_ => {
          paygroupFormArray.push(this.createpaygroupComponentsBenefitFormGroup(_));
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

  private getComponentForDeduction(): void {

    try {
      this.apiCalling.getData("Salary", `getSalaries/`, true,{
        salaryType:2
      })
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this.salaryComponentDeduction = response?.data?.salaries;
            } else {
              this.salaryComponentDeduction = [];
            }
          },
          error: (error) => {
            this.salaryComponentDeduction = [];
          }
        });
    } catch (error) {
      console.log(error);

    }

  }

  private getComponentForBenefit(): void {

    try {
      this.apiCalling.getData("Salary", `getSalaries/`, true,{
        salaryType:1
      })
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this.salaryComponentBenefit = response?.data?.salaries;
            } else {
              this.salaryComponentBenefit = [];
            }
          },
          error: (error) => {
            this.salaryComponentBenefit = [];
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
    if (index >= 0 && index < this.paygroupComponentsBenefit.length) {
      // Update the specific 'amount' field in the paygroupComponentsBenefit array
      const paygroupArray = this.addEditForm.get('paygroupComponentsBenefit') as FormArray;
      const component = paygroupArray.at(index) as FormGroup;

      // Set the new value for the 'amount' field
      component.get('amount')?.setValue(input.value);
    }
  }



  // table
  addRowBenefit() {
    const formData = this.fb.group({
      salaryId: ['', Validators.required],
      salaryType: [1, Validators.required],
      calculationType: [0, Validators.required],
      amount: ['', Validators.required],
    });
    this.paygroupComponentsBenefit.push(formData);
  }

  get paygroupComponentsBenefit(): FormArray {
    return this.addEditForm.controls["paygroupComponentsBenefit"] as FormArray;
  }


  deleteRowBenefit(index: number): void {

    if (index >= 0 && index < this.paygroupComponentsBenefit.length) {
      const updatedControls = this.paygroupComponentsBenefit.controls.filter((_, i) => i !== index);
      this.addEditForm.setControl('paygroupComponentsBenefit', this.fb.array(updatedControls));
    } else {
    }

  }



  // table
  addRowDeduction() {
    const formData = this.fb.group({
      salaryId: ['', Validators.required],
      salaryType: [2, Validators.required],
      calculationType: [0, Validators.required],
      amount: ['', Validators.required],
    });
    this.paygroupComponentsDeduction.push(formData);
  }

  get paygroupComponentsDeduction(): FormArray {
    return this.addEditForm.controls["paygroupComponentsDeduction"] as FormArray;
  }


  deleteRowDeduction(index: number): void {

    if (index >= 0 && index < this.paygroupComponentsDeduction.length) {
      const updatedControls = this.paygroupComponentsDeduction.controls.filter((_, i) => i !== index);
      this.addEditForm.setControl('paygroupComponentsDeduction', this.fb.array(updatedControls));
    } else {
    }

  }


  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
