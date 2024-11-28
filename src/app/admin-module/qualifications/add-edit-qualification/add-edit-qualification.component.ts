import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-qualification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit-qualification.component.html',
  styleUrl: './add-edit-qualification.component.css'
})
export class AddEditQualificationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  qualificationForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedQualification: any;

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
        this.apiCalling.getData("Qualification", `getQualificationById/${id}`, true)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedQualification = response?.data;
                this.patchFormValues(); // Call patchFormValues here after setting selectedQualification
              } else {
                this.selectedQualification = [];
              }
            },
            error: (error) => {
              this.selectedQualification = [];
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
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });
  }

  private patchFormValues(): void {
    if (this.selectedQualification) {
      this.qualificationForm.patchValue({
        name: this.selectedQualification.name,
        description: this.selectedQualification.description
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
      ? this.apiCalling.putData("Qualification", `updateQualification/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Qualification", "addQualification", body, true);

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
    this.router.navigate(['/admin/qualifications']);
  }
}
