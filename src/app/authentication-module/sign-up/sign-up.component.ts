import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiCallingService } from '../../shared/Services/api-calling.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signupForm: FormGroup = new FormGroup({});
  loading = false;
  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private _apiCalling: ApiCallingService,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required,Validators.email]],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[!@#$%^&*])/)]],
      companyName: ['',Validators.required,],
      address: [''],
      country: [''],
      city: [''],
    });
  }

  goToNextStep(): void {
    if (this.currentStep === 1 && this.signupForm.get('fullName')?.valid && this.signupForm.get('email')?.valid && this.signupForm.get('password')?.valid) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.signupForm.get('address')?.valid && this.signupForm.get('country')?.valid && this.signupForm.get('city')?.valid) {
      this.currentStep = 3;
    }
  }

  canProceedToNextStep(): boolean | undefined {
    if (this.currentStep === 1) {
      return this.currentStep === 1 && this.signupForm.get('fullName')?.valid && this.signupForm.get('email')?.valid && this.signupForm.get('password')?.valid;
    } else if (this.currentStep === 2) {
      return this.currentStep === 2 && this.signupForm.get('address')?.valid && this.signupForm.get('country')?.valid && this.signupForm.get('city')?.valid;
    }
    return false;
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid && this.currentStep === 3) {
      this._apiCalling.postData("Auth", "signUp", this.signupForm.value, true).subscribe({
        next: (response) => {

          console.log('Sign up successful', response);
          this.signupForm.reset();
          this.currentStep = 1;
        },
        error: (error) => {
          console.error('Sign up failed', error);
        }
      });
    }
  }
}
