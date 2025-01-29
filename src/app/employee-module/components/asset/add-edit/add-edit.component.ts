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
      }else{
        this.addRow()
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
    if (index >= 0 && index < this.assetListData.length) {
      // Update the specific 'amount' field in the paygroupComponents array
      const arr = this.addEditForm.get('assetListData') as FormArray;
      const component = arr.at(index) as FormGroup;

      // Set the new value for the 'amount' field
      component.get(name)?.setValue(input.value);
    }
  }


  private convertToDatetimeLocalFormat(dateString: string): string {
    if(dateString){const date = new Date(dateString);
    return date.toISOString().split("T")[0]}else{
      return ''
    }
  }
  onDateTimeChange(event: Event, valueName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToDatetimeLocalFormat(input.value);
      this.addEditForm.patchValue({ valueName: formattedValue });
    }
  }
  private formatDateForSubmission(dateString: string): string {
    if(dateString){
      const date = new Date(dateString);
      return date.toISOString();
    }else{
      return ''
    }

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      assetListData: this.fb.array([]),
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
        this.addEditForm.patchValue({
            assetTypeId: this.selectedValue.assetTypeId,
            // Ensure all necessary fields are included
        });
        this.empAssTypesList.push({ assetId: this.selectedValue.assetId, assetName: this.selectedValue.assetName });


        const formData = this.fb.group({
            issuedDate: [this.convertToDatetimeLocalFormat(this.selectedValue.issuedDate) || '', Validators.required],
            assetTypeId: [this.selectedValue.assetTypeId || null, Validators.required],
            assetId: [this.selectedValue.assetId || null, Validators.required],
            specification: [this.selectedValue.specification || null, Validators.required],
            companyCode: [this.selectedValue.companyCode || null, Validators.required],
            quantity: [this.selectedValue.quantity || null, Validators.required],
            returnStatus: [this.selectedValue.returnStatus || false],
            returnDate: [this.convertToDatetimeLocalFormat(this.selectedValue.returnDate) || null],
            offSet: [this.selectedValue.offSet || null]
        });

        this.assetListData.push(formData);


        if (this.assetListData.length === 0) {
          this.addRow();
        }
    }
  }

  submitForm(): void {



    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const { assetListData, ...rest } = this.addEditForm.value;

    // Format issuedDate for each item in assetListData
    const formattedAssetListData = assetListData.map(({ assetTypeId, ...item }) => ({
      ...item,
      issuedDate: this.formatDateForSubmission(item['issuedDate']),
      returnDate: this.formatDateForSubmission(item['returnDate'])
    }))

    const apiCall = this.isEditMode
      ? this.apiCalling.putData('EmployeeAsset', `updateEmployeeAsset/${this.isEditMode}`, formattedAssetListData[0], true, this.id)
      : this.apiCalling.postData('EmployeeAsset', "addEmployeeAsset", formattedAssetListData, true, this.id);

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
    console.log('Adding a new row...');
    const formData = this.fb.group({
      issuedDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, Validators.required],
      assetTypeId: [null, Validators.required],
      assetId: [null, Validators.required],
      specification: [null, Validators.required],
      companyCode: [null, Validators.required],
      quantity: [null, Validators.required],
      returnStatus: [false],
      returnDate: [null],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
    this.assetListData.push(formData);
  }

  get assetListData(): FormArray {
    return this.addEditForm.controls["assetListData"] as FormArray;
  }

  deleteRow(index: number): void {
    if (index >= 0 && index < this.assetListData.length) {
        const updatedControls = this.assetListData.controls.filter((_, i) => i !== index);
        this.addEditForm.setControl('assetListData', this.fb.array(updatedControls));
    } else {
        // Handle invalid index case if necessary
    }
  }

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
