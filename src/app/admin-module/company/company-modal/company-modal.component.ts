import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Typess {
  typeId: number;
  typeName: string;
}
@Component({
  selector: 'app-company-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './company-modal.component.html',
  styleUrl: './company-modal.component.css'
})

export class CompanyModalComponent implements OnInit {
  types: any[] = []
  createCompanyForm!: FormGroup;
  projectTypes: any;
  emailList: string[] = []
  createProjectResult: any;
  maxDate = new Date();
  @Input()
  align!: 'start' | 'center' | 'end'
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, public dialogRef: MatDialogRef<CompanyModalComponent>) {
  }
  ngOnInit() {
    this.setForm()
  }

  setForm() {
    this.createCompanyForm = this.fb.group({

    });
    this.createCompanyForm.patchValue({

    })

  }


  addEmailAddress(v: any) {

    if (!this.emailList.includes(v)) {
      this.emailList.push(v)
    }

  }

  removeEmailAddress(v: any) {

    this.emailList.splice(v, 1)

  }

  onSubmit() {

  }

  onUpdate() {

  }

  close(): void {
    this.dialogRef.close()
  }
}