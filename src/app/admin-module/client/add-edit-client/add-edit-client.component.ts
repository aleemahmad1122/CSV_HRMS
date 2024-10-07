import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../../shared/Services/user-authentication.service';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';

interface ClientType {
  clientTypeId: number;
  clientTypeName: string;
}

@Component({
  selector: 'app-add-edit-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-edit-client.component.html',
  styleUrl: './add-edit-client.component.css'
})
export class AddEditClientComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  clientForm!: FormGroup;
  isEditMode: boolean = false;
  defaultImagePath = '../../../assets/media/users/blank.png';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;
  selectedClient: any;

  clients: ClientType[] = [
    { clientTypeId: 1, clientTypeName: 'Client 1' },
    { clientTypeId: 2, clientTypeName: 'Client 2' },
    { clientTypeId: 3, clientTypeName: 'Client 3' },
  ];

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _route: ActivatedRoute,
    private _toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      this.isEditMode = false;
      this.selectedClient = {};
      if (params['clientId'] !== undefined && params['clientId'] !== null && params['clientId'] !== '' && params['clientId'] !== 0) {
        this.isEditMode = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedClient = JSON.parse(localStorage.getItem('client')!);
        }
      }
    });
  }

  ngOnInit(): void {
    this.isEditMode = this._router.url.includes('edit');

    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      details: ['', Validators.required],
      address: ['', Validators.required],
      contact_number: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      company_url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      status: ['Active', Validators.required],
      first_contact_date: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm() {
    console.log(this.clientForm.value);
    if (!this.clientForm.valid) {
      return;
    }

    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('companyImage', this.selectedFile);
    }

    Object.keys(this.clientForm.controls).forEach(key => {
      formData.append(key, this.clientForm.get(key)?.value);
    });

    const endpoint = this.isEditMode ? `edit/${this.selectedClient.clientId}` : 'add';
    const method = this.isEditMode ? this._apiCalling.putData : this._apiCalling.postData;

    method.call(this._apiCalling, "client", endpoint, formData, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            if (!this.isEditMode) {
              this._authService.saveUser(response?.data?.user);
              this._authService.saveUserRole(response?.data?.user?.role);
              this._authService.setToken(response?.data?.token);
              this._dataShare.updateLoginStatus(true);
              this._router.navigate([`${'/dashboard'}`]);
            } else {
              this._toaster.success(response?.message, 'Success!');
              this.goBack();
            }
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occurred while processing your request");
        }
      });
  }

  goBack() {
    this._router.navigate([`${'/admin/clients'}`]);
  }

}
