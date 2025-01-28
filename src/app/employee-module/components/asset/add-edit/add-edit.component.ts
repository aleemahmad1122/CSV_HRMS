import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { IAssetType } from '../../../../types';
import { environment } from '../../../../../environments/environment.prod';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule, NgSelectModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };

  private ngUnsubscribe = new Subject<void>();


  rStatusList:{label:string;value:boolean}[] = [
    {
      label:"Yes",
      value:true
    },
    {
      label:"No",
      value:false
    },
  ]

  id: string = ''
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;
  typesList: IAssetType[];

  empAssTypesList: { assetId: string; assetName: string; }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.addEditForm = this.createForm();
    this.addRow()
  }

  ngOnInit(): void {

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      const editId = params['editId'];
      this.id = id
      this.isEditMode = editId;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData('EmployeeAsset', `getEmployeeAssetById/${editId}`, true, { employeeId: this.id })
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedValue = response?.data;
                this.patchFormValues();
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
      this.getTypes()
    });
  }


  private getTypes(): void {
    this.apiCalling
      .getData('AssetType', `getAssetType`, true, { employeeId: this.id })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response) {
            this.typesList = response?.data?.assetTypes;
            this.addEditForm.patchValue({ assetTypeId: this.typesList?.[0]?.assetTypeId });
            this.patchFormValues();
            if (!this.isEditMode) {
              this.getEmpAssTypes({ assetTypeId: this.typesList?.[0]?.assetTypeId })
            }
          } else {
            this.typesList = [];
          }
        },
        error: () => {
          this.typesList = [];
        },
      });
  }

  getEmpAssTypes(event?): void {

    this.apiCalling
      .getData('EmployeeAsset', `getAssetByAssetTypeId/${event?.assetTypeId}`, true, { employeeId: this.id })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response) {
            this.empAssTypesList = response?.data;
            this.patchFormValues();
          } else {
            this.empAssTypesList = [];
          }
        },
        error: () => {
          this.empAssTypesList = [];
        },
      });
  }



  onAmountInput(event: Event, index: number,name:string): void {
    const input = event.target as HTMLInputElement;
    // Allow only digits in the input
    input.value = input.value.replace(/[^0-9]/g, '');

    // Check if the index is valid
    if (index >= 0 && index < this.shiftPolicies.length) {
      // Update the specific 'amount' field in the paygroupComponents array
      const arr = this.addEditForm.get('shiftPolicies') as FormArray;
      const component = arr.at(index) as FormGroup;

      // Set the new value for the 'amount' field
      component.get(name)?.setValue(input.value);
    }
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
    return date.toISOString();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      shiftPolicies: this.fb.array([]),
      // issuedDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, Validators.required],
      // assetId: ['', Validators.required],
      // assetTypeId: [this.isEditMode ? '' : this.typesList?.[0]?.assetTypeId || '', Validators.required],
      // description: ['', Validators.required],
      // offSet: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        // issuedDate: this.convertToDatetimeLocalFormat(this.selectedValue.issuedDate),
        // assetId: this.selectedValue.assetId,
        // assetTypeId: this.selectedValue.assetTypeId,
        // description: this.selectedValue.description,
        // offSet: Number(this.selectedValue.offSet),
      });
      this.empAssTypesList.push({ assetId: this.selectedValue.assetId, assetName: this.selectedValue.assetName })
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const { assetTypeId, issuedDate, ...rest } = this.addEditForm.value;
    const payload = {
      issuedDate: this.formatDateForSubmission(issuedDate),
      ...rest,
      offSet: this.addEditForm.value.offSet.toString()
    }

    const apiCall = this.isEditMode
      ? this.apiCalling.putData('EmployeeAsset', `updateEmployeeAsset/${this.isEditMode}`, payload, true, this.id)
      : this.apiCalling.postData('EmployeeAsset', "addEmployeeAsset", payload, true, this.id);

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



  addRow() {
    const formData = this.fb.group({
      issuedDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, Validators.required],
      assetTypeId: [null, Validators.required],
      assetId: [null, Validators.required],
      specification: [null, Validators.required],
      companyCode: [null, Validators.required],
      quantity: [null, Validators.required],
      returnStatus: [true, Validators.required],
      returnDate: [null, Validators.required],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
    this.shiftPolicies.push(formData);
  }

  get shiftPolicies(): FormArray {
    return this.addEditForm.controls["shiftPolicies"] as FormArray;
  }

  deleteRow(index: number): void {

    if (index >= 0 && index < this.shiftPolicies.length) {
      const updatedControls = this.shiftPolicies.controls.filter((_, i) => i !== index);
      this.addEditForm.setControl('shiftPolicies', this.fb.array(updatedControls));
    } else {
    }

  }

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
