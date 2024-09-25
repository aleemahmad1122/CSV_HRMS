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
    signUpForm: FormGroup = new FormGroup({});
    loading = false;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
    }

    onSubmit(): void {
      if (this.signUpForm.valid) {
        this.loading = true;
        console.log('Form Submitted', this.signUpForm.value);

        // Simulate server call
        setTimeout(() => {
          this.loading = false;
          alert('Sign-up successful!');
        }, 2000);
      } else {
        alert('Please fill in all fields correctly.');
      }
    }
  }
