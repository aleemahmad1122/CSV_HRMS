import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DpDatePickerModule,NgSelectModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };

  private ngUnsubscribe = new Subject<void>();

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
              this.getEmpAssTypes()
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

  getEmpAssTypes(): void {
    this.apiCalling
      .getData('EmployeeAsset', `getAssetByAssetTypeId/${this.addEditForm.value['assetTypeId']}`, true, { employeeId: this.id })
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
      issuedDate: [`${this.convertToDatetimeLocalFormat(environment.defaultDate)}`, Validators.required],
      assetId: ['', Validators.required],
      assetTypeId: [this.isEditMode ? '' : this.typesList?.[0]?.assetTypeId || '', Validators.required],
      description: ['', Validators.required],
      offSet: [new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        issuedDate: this.convertToDatetimeLocalFormat(this.selectedValue.issuedDate),
        assetId: this.selectedValue.assetId,
        assetTypeId: this.selectedValue.assetTypeId,
        description: this.selectedValue.description,
        offSet: Number(this.selectedValue.offSet),
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

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
}
