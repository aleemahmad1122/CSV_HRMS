import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';

interface Status {
  statusId: number | string;
  statusName: string;
}

@Component({
  selector: 'app-add-edit-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.css']
})
export class AddEditProjectComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;
  status: Status[] = [
    { statusId: 1, statusName: "Active" },
    { statusId: 2, statusName: "InActive" }
  ];

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

      if (this.isEditMode) {
        this.apiCalling.getData("Project", `getProjectById/${id}`, true)
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
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      statusId: ['1', Validators.required],
      description: ['', Validators.required],
      budget: ['', Validators.required],
      currency: ['', Validators.required],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        name: this.selectedValue.name,
        startDate: this.convertToDatetimeLocalFormat(this.selectedValue.startDate),
        endDate: this.convertToDatetimeLocalFormat(this.selectedValue.endDate),
        statusId: this.selectedValue.statusId,
        description: this.selectedValue.description,
        budget: this.selectedValue.budget,
        currency: this.selectedValue.currency
      });
    }
  }

  private convertToDatetimeLocalFormat(dateString: string): string {
    // Convert to 'yyyy-MM-ddTHH:mm' format for `datetime-local` input type
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);  // 'YYYY-MM-DDTHH:mm'
  }

  formatStartDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addEditForm.patchValue({
      startDate: new Date(input.value).toISOString()
    });
  }

  formatEndDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addEditForm.patchValue({
      endDate: new Date(input.value).toISOString()
    });
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToDatetimeLocalFormat(input.value); // Use the conversion function
      this.addEditForm.patchValue({ startDate: formattedValue });
    }
  }

  onEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const formattedValue = this.convertToDatetimeLocalFormat(input.value); // Use the conversion function
      this.addEditForm.patchValue({ endDate: formattedValue });
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = { ...this.addEditForm.value };

    // Format startDate and endDate to the desired format
    body.startDate = this.formatDateForSubmission(body.startDate);
    body.endDate = this.formatDateForSubmission(body.endDate);

    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Project", `updateProject/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Project", "addProject", body, true);

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

  private formatDateForSubmission(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString(); // This will return the date in 'YYYY-MM-DDTHH:mm:ss.sssZ' format
  }

  goBack(): void {
    this.router.navigate(['/admin/projects']);
  }
}


