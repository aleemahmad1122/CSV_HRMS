import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      state: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  goToNextStep(): void {
    if (this.currentStep === 1 && this.signupForm.get('fname')?.valid && this.signupForm.get('lname')?.valid) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.signupForm.get('address1')?.valid && this.signupForm.get('state')?.valid && this.signupForm.get('country')?.valid) {
      this.currentStep = 3;
    }
  }

  canProceedToNextStep(): boolean | undefined {
    if (this.currentStep === 1) {
      return this.signupForm.get('fname')?.valid && this.signupForm.get('lname')?.valid;
    } else if (this.currentStep === 2) {
      return this.signupForm.get('address1')?.valid && this.signupForm.get('state')?.valid && this.signupForm.get('country')?.valid;
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
      console.log(this.signupForm.value);
    }
  }
}
