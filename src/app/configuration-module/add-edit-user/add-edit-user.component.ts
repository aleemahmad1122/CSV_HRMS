import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxFileDropModule } from 'ngx-file-drop';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-add-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxFileDropModule, TranslateModule],
  templateUrl: './add-edit-user.component.html',
  styleUrl: './add-edit-user.component.css'
})
export class AddEditUserComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  userForm!: FormGroup;
  isEdit: boolean = false;
  selectedUser: any;
  locations: any[] = [];
  userImage: any = {};
  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.userImage = {};
    this.userImage.isNewImageAttached = false;
    this.userImage.image = null;
    this.userImage.imageUrl = '../assets/img/avatars/blank.png';

    this.route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.selectedUser = {};
      if (params['userId'] !== undefined && params['userId'] !== null && params['userId'] !== '' && params['userId'] !== 0) {
        this.isEdit = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedUser = JSON.parse(localStorage.getItem('tempUser')!);
        }

      }
    });

    this.userForm = this._fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      locationId: ['', [Validators.required]],
      role: ['', [Validators.required]],
    });
  }

  prefilledForm(): void {
    if (!this.isEdit)
      return;

    this.userForm.patchValue({
      firstName: this.selectedUser.firstName,
      lastName: this.selectedUser.lastName,
      email: this.selectedUser.email,
      locationId: Number(this.selectedUser.locationId),
      role: this.selectedUser.role
    });
    this.userImage = {};
    this.userImage.isNewImageAttached = false;
    this.userImage.image = null;
    this.userImage.imageUrl = this.selectedUser.profileImage !== null ? this.selectedUser.profileImage : '../assets/img/avatars/blank.png';
    this.userForm?.get('password')?.clearValidators();
    this.userForm?.get('password')?.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.getLocations();
  }

  getLocations(): void {
    this._apiCalling.getData('location', '', false).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.locations = response.data;
          this.prefilledForm();
        } else {
          this._toaster.error(response?.message, 'Error!');
        }
      },
      error: (error) => {
        this._toaster.error("Internal server error occured while processing your request")
      }
    })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tempUser');
    }

  }

  submitForm(): void {
    if (!this.userForm.valid) {
      return;
    }

    if (!this.isEdit) {
      var formData = new FormData();
      formData.append('firstName', this.userForm.get('firstName')?.value);
      formData.append('lastName', this.userForm.get('lastName')?.value);
      formData.append('email', this.userForm.get('email')?.value);
      formData.append('password', this.userForm.get('password')?.value);
      formData.append('locationId', this.userForm.get('locationId')?.value);
      formData.append('role', this.userForm.get('role')?.value);

      if (this.userImage.isNewImageAttached) {
        formData.append('profileImage', this.userImage.image);
      }
      formData.append('actionBy', String(this._authService.getUserId()));

      this._apiCalling.postData("user", "add", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.backToUsers();

            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    } else {
      var formData = new FormData();
      formData.append('firstName', this.userForm.get('firstName')?.value);
      formData.append('lastName', this.userForm.get('lastName')?.value);
      formData.append('email', this.userForm.get('email')?.value);
      formData.append('locationId', this.userForm.get('locationId')?.value);
      formData.append('role', this.userForm.get('role')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      if (this.userImage.isNewImageAttached) {
        formData.append('profileImage', this.userImage.image);
      }
      if (this.userForm.get('password')?.value !== '') {
        formData.append('password', this.userForm.get('password')?.value);
      }
      this._apiCalling.putData("user", "edit/" + this.selectedUser.userId + "", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.backToUsers();

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

  backToUsers(): void {
    this._router.navigate([`${'/configuration/users'}`]);
  }

  attachFile(event: any): void {

    if (event.target.files[0].name.split('.').pop() === 'png' || event.target.files[0].name.split('.').pop() === 'jpg' || event.target.files[0].name.split('.').pop() === 'jpeg') {
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.userImage = {};
        this.userImage.isNewImageAttached = true;
        this.userImage.image = file;
        this.userImage.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this._toaster.error('Invalid file extension', 'Error!');
    }

  }

  resetImage(): void {
    this.userImage = {};
    this.userImage.isNewImageAttached = false;
    this.userImage.image = null;
    this.userImage.imageUrl = '../assets/img/avatars/blank.png';
  }

}
