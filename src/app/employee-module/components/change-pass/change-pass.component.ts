import { ToastrService } from 'ngx-toastr';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { IEmployeeShift, IShift} from '../../../types/index';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule  } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup,  ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';



@Component({
  selector: 'app-change-pass',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './change-pass.component.html',
  styleUrl: './change-pass.component.css'
})
export class ChangePassComponent  implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  employeeShifList: IEmployeeShift[] = [];
  shiftList: IShift[] = [];
  addEditForm: FormGroup;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  isAddMode: boolean = false;
  isSubmitted = false;
  selectedValue: any;
  id: string = "";
  passwordMismatch = false;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id']
    });
    this.addEditForm = this.createForm();
    this.addEditForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMismatch();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
  getPasswordErrors(): string[] {
    const control = this.addEditForm.get('newPassword');
    const errors: string[] = [];

    if (control?.errors && (control.touched || this.isSubmitted)) {
      if (control.errors['required']) {
        errors.push('language.errors.newPasswordRequired');
      }
      if (control.errors['minlength']) {
        errors.push('language.errors.passwordMinLength');
      }
      if (control.errors['pattern']) {
        if (!/(?=.*[A-Z])/.test(control.value)) {
          errors.push('language.errors.passwordUppercase');
        }
        if (!/(?=.*[a-z])/.test(control.value)) {
          errors.push('language.errors.passwordLowercase');
        }
        if (!/(?=.*\d)/.test(control.value)) {
          errors.push('language.errors.passwordNumber');
        }
        if (!/(?=.*[@$!%*?&])/.test(control.value)) {
          errors.push('language.errors.passwordSpecial');
        }
      }
    }
    return errors;
  }

  submitForm(): void {
   const {confirmPassword,...rest} =  this.addEditForm.value
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    this.apiCalling.postData("Auth", "updatePassword", rest, true, this.id)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toaster.success(response.message, 'Success!');
          } else {
            this.toaster.error(response?.message || 'An error occurred', 'Error!');
          }
        },
        error: () => {
          this.toaster.error('An error occurred while processing your request', 'Error');
        }
      });
  }

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }

  private checkPasswordMismatch(): void {
    this.passwordMismatch = this.addEditForm.hasError('mismatch');
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'oldPassword') {
      this.showOldPassword = !this.showOldPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
