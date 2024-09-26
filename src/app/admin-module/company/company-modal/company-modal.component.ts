import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-company-modal',
  standalone: true,
  imports: [],
  templateUrl: './company-modal.component.html',
  styleUrl: './company-modal.component.css'
})
export class CompanyModalComponent {
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
      Id: [null],
      CompanyName: ['', Validators.required],
      Country: ['', Validators.required],
      City: ['', Validators.required],
      ContactPerson: ['', Validators.required],
      OfficeContactNumber: ['', Validators.required],
      MobileNumber: ['', Validators.required],
      EmailAddress: ['', [Validators.required, Validators.email]],
    });
    this.createCompanyForm.patchValue({
      Id: this.data.id,
      CompanyName: this.data.companyName,
      Country: this.data.country,
      City: this.data.city,
      ContactPerson: this.data.contactPerson,
      OfficeContactNumber: this.data.officeContactNumber,
      MobileNumber: this.data.mobileNumber,
      EmailAddress: this.data.emailAddress,
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