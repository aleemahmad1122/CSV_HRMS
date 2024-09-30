import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';
import { UserAuthenticationService } from '../../../shared/Services/user-authentication.service';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';

interface Typess {
  typeId: number;
  typeName: string;
}

@Component({
  selector: 'app-add-edit-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './add-edit-company.component.html',
  styleUrl: './add-edit-company.component.css'
})

export class AddEditCompanyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  companyForm!: FormGroup;
  isEditMode: boolean = false;
  defaultImagePath = '../../../assets/media/users/blank.png';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;

  types: Typess[] = [
    { typeId: 1, typeName: 'Head Office' },
    { typeId: 2, typeName: 'Branch' },
    { typeId: 3, typeName: 'Subsidiary' },
  ];

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _toaster: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isEditMode = this._router.url.includes('edit');

    this.companyForm = this.fb.group({
      companyImage: ['', Validators.required],
      name: ['', Validators.required],
      details: ['', Validators.required],
      address: ['', Validators.required],
      type: ['', Validators.required],
      country: ['', Validators.required],
      timeZone: ['', Validators.required],
      parentStructure: ['', Validators.required],
      heads: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  submitForm() {
    if (!this.companyForm.valid) {
      return;
    }

    this._apiCalling.postData("company", "addEditCompany",
      {
        "companyImage": this.selectedFile,
        "name": this.companyForm.get('name')?.value,
        "heads": this.companyForm.get('heads')?.value,
        "type": this.companyForm.get('type')?.value,
        "country": this.companyForm.get('country')?.value,
        "timeZone": this.companyForm.get('timeZone')?.value,
        "parentStructure": this.companyForm.get('parentStructure')?.value,
        "address": this.companyForm.get('address')?.value,
        "details": this.companyForm.get('details')?.value,
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._authService.saveUser(response?.data?.user);
            this._authService.saveUserRole(response?.data?.user?.role);
            this._authService.setToken(response?.data?.token);
            this._dataShare.updateLoginStatus(true);
            this._router.navigate([`${'/dashboard'}`]);

          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  cancelForm() {
    this.companyForm.reset();
    this._router.navigate(['/company-structure']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > this.maxSizeInBytes) {
        this.imageSizeExceeded = true;
        return;
      }

      this.imageSizeExceeded = false;
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imagePreview = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = this.defaultImagePath;
    this.selectedFile = null;
    this.imageSizeExceeded = false;
  }
}
