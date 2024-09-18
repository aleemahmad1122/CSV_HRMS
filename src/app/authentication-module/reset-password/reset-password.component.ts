import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  private ngUnsubscribe = new Subject<void>();
  resetPasswordForm!: FormGroup;
  isShowPassword: boolean = false;
  token: string = "";
  showForm: boolean = false;
  constructor (
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private activatedRoute: ActivatedRoute,
    private _router: Router
  ) {
    this.token = "";
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.token = "";
      if (params['token'] !== "" && params['token'] !== undefined && params['token'] !== null) {
        this.token = params['token'];
        this._apiCalling.postData("auth","validatePasswordLink",
          {
            "token": this.token,
          }, true)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if(response?.success) {
                this.showForm = true;
              } else {
                this._toaster.error('Link may expired or having some internal server error. Please generate request again!', 'Error!');
                this._router.navigateByUrl('/forget-password');
              }
            },
            error: (error) => {
             this._toaster.error("Internal server error occured while processing your request")
            }
          })
        }
      });

      this.resetPasswordForm  = this._fb.group({
        newPassword: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      }, { validator: this.mustMatch('newPassword', 'confirmPassword') });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  ngOnInit(): void {  
    
  } 

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm(): void {
    if(!this.resetPasswordForm.valid) {
      return ; 
    }

    this._apiCalling.postData("auth","updatePassword",
    {
      "password": this.resetPasswordForm.get('newPassword')?.value,
      "token": this.token,
    }, true)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if(response?.success) {
          this._toaster.success('Password reset successfully','Success!');
          this._router.navigateByUrl('/');
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
