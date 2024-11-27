import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';


interface ClientType  { clientTypeId: number | string; clientTypeName: string}

@Component({
  selector: 'app-add-edit-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit-client.component.html',
  styleUrl: './add-edit-client.component.css'
})
export class AddEditClientComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode :boolean | string= false;
  isSubmitted = false;
  selectedValue: any;

  clients: ClientType[] = [
    { clientTypeId: 1, clientTypeName: 'Client 1' },
    { clientTypeId: 2, clientTypeName: 'Client 2' },
    { clientTypeId: 3, clientTypeName: 'Client 3' },
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

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {
        this.apiCalling.getData("Client", `getClientById/${id}`,  true)
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
      name: ['', Validators.required],
      details: [''],
      address: ['', Validators.required],
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.required, Validators.pattern('https?://.+')]],
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {
      this.addEditForm.patchValue({
        name: this.selectedValue.name,
        details: this.selectedValue.details,
        address: this.selectedValue.address,
        contactNumber: this.selectedValue.contactNumber,
        email: this.selectedValue.email,
        website: this.selectedValue.website,
      });
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = this.addEditForm.value;
    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Client", `updateClient/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Client", "addClient", body, true);

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
    this.router.navigate(['/admin/clients']);
  }
}
