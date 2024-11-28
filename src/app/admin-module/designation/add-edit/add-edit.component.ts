import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  qualificationForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.qualificationForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      this.isEditMode = id;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("Designation", `getDesignationById/${id}`, true)
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
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      designationTitle: ['', [Validators.required, Validators.maxLength(100)]],
      designationCode: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.qualificationForm.patchValue({

        designationTitle: this.selectedValue.designationTitle,
        designationCode: this.selectedValue.designationCode,
        description: this.selectedValue.description
      });
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.qualificationForm.invalid) {
      return;
    }

    const body = this.qualificationForm.value;
    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Designation", `updateDesignation/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Designation", "addDesignation", body, true);

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
        this.toaster.error("An error occurred while processing your request. Please try again later.");
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/designation']);
  }
}
