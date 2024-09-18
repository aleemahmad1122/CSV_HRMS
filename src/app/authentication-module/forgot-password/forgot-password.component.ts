import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],

  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private ngUnsubscribe = new Subject<void>();
  forgotPasswordForm!: FormGroup;
  isShowPassword: boolean = false;
  constructor(
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService) {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm(): void {
    if (!this.forgotPasswordForm.valid) {
      return;
    }

    this._apiCalling.postData("auth", "forgetPassword",
      {
        "email": this.forgotPasswordForm.get('email')?.value,
        "link": document.getElementsByTagName('base')[0].href
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success('Email is sent. Please follow the instruction mentioned on email!', 'Success!');
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
