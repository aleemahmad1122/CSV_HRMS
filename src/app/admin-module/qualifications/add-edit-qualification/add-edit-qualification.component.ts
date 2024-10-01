import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../../shared/Services/user-authentication.service';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-qualification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit-qualification.component.html',
  styleUrl: './add-edit-qualification.component.css'
})
export class AddEditQualificationComponent {
  private ngUnsubscribe = new Subject<void>();
  qualificationForm!: FormGroup;
  isEditMode: boolean = false;
  selectedQualification: any;
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      this.isEditMode = false;
      this.selectedQualification = {};
      if (params['qualificationId'] !== undefined && params['qualificationId'] !== null && params['qualificationId'] !== '' && params['qualificationId'] !== 0) {
        this.isEditMode = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedQualification = JSON.parse(localStorage.getItem('qualification')!);
        }
      }
    });
  }


  ngOnInit(): void {
    this.isEditMode = this._router.url.includes('edit');

    this.qualificationForm = this._fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm() {
    if (!this.qualificationForm.valid) {
      return;
    }

    if (!this.isEditMode) {
      const formData = new FormData();
      formData.append('name', this.qualificationForm.get('name')?.value || '');
      formData.append('description', this.qualificationForm.get('description')?.value || '');

      this._apiCalling.postData("qualification", "add", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.goBack();

            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        });
    }

    else {
      var formData = new FormData();
      formData.append('name', this.qualificationForm.get('name')?.value || '');
      formData.append('description', this.qualificationForm.get('description')?.value || '');

      this._apiCalling.putData("qualification", "edit/" + this.selectedQualification.qualificationId + "", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.goBack();

            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    }
  }

  goBack() {
    this._router.navigate([`${'/admin/qualifications'}`]);
  }
}
