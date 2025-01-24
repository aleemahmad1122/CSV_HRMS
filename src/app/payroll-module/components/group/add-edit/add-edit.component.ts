import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { SalaryFrequencies } from '../../../../types';

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
  frameworks:{value:number;name:string}[] = [{value:0,name: 'fixed'},{value:1,name:'hourly'}];

  salaryFrequenciesList:SalaryFrequencies []

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
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      this.isEditMode = id;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("Paygroup", `getPaygroupById/${id}`,  true)
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
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      salaryFrequencyId: [null, Validators.required],
      paygroupType: [this.frameworks[0], Validators.required],
      description: [''],
      paygroupComponents:this.fb.array([
        {
          "salaryId": "44Ae55-e3ed9f89a473f-40BeBff7E9bEd48",
          "salaryType": 0,
          "calculationType": 0,
          "amount": "string"
        }
      ])
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        title: this.selectedValue.title,
        paygroupType: this.selectedValue.paygroupType,
        description: this.selectedValue.description,
        salaryFrequencyId: this.selectedValue.salaryFrequencyId,
      });
    }
  }

  private getFrequency():void{

try {
  this.apiCalling.getData("SalaryFrequency", `getSalaryFrequencies/`,  true)
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

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
