import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../../shared/Services/user-authentication.service';
import { DataShareService } from '../../../shared/Services/data-share.service';
import { ToastrService } from 'ngx-toastr';

interface ItemTypes {
  typeId: number;
  typeName: string;
}

@Component({
  selector: 'app-add-edit-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-edit-job.component.html',
  styleUrls: ['./add-edit-job.component.css']
})
export class AddEditJobComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  data: any | null = null;
  addEditForm!: FormGroup;
  isEditMode: boolean = false;
  defaultImagePath = '../../../assets/media/users/blank.png';
  imagePreview: string = this.defaultImagePath;
  selectedFile: File | null = null;
  imageSizeExceeded: boolean = false;
  maxSizeInBytes = 1048576;
  selectedItem: any;
  isSubmitted = false;
  itemId: number = 0;

  itemTypes: ItemTypes[] = [
    { typeId: 1, typeName: 'Type A' },
    { typeId: 2, typeName: 'Type B' },
    { typeId: 3, typeName: 'Type C' },
  ];

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _route: ActivatedRoute,
    private _toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._route.queryParams.subscribe(params => {
      this.isEditMode = false;
      this.selectedItem = {};
      if (params['id'] !== undefined && params['id'] !== null && params['id'] !== '' && params['id'] !== 0) {
        this.isEditMode = true;
        this.itemId = params['id'];
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode) {
      this.loadItemData();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  initForm() {
    this.addEditForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      specification: ['', Validators.required]
    });
  }

  loadItemData() {
    this._apiCalling.getData("item", "getById/" + this.itemId, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.selectedItem = response?.data;
            this.patchFormValues();
          }
        },
        error: (error) => {
          this._toaster.error("Error loading item data");
        }
      });
  }

  patchFormValues() {
    this.addEditForm.patchValue({
      code: this.selectedItem?.code,
      name: this.selectedItem?.name,
      description: this.selectedItem?.description,

    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.addEditForm.valid) {
      this.isEditMode ? this.update() : this.create();
    } else {
      this.markFormGroupTouched(this.addEditForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  create() {
    const formData = this.prepareFormData();
    this._apiCalling.postData("item", "add", formData, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success("Item created successfully", 'Success!');
            this._router.navigate(['/admin/item']);
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("An error occurred while processing your request");
        }
      });
  }

  update() {
    const formData = this.prepareFormData();
    this._apiCalling.putData("item", "edit/" + this.itemId, formData, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            this._router.navigate(['/admin/item']);
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("An error occurred while processing your request");
        }
      });
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('itemImage', this.selectedFile);
    }
    Object.keys(this.addEditForm.controls).forEach(key => {
      formData.append(key, this.addEditForm.get(key)?.value);
    });
    return formData;
  }

  goBack() {
    this.addEditForm.reset();
    this._router.navigate(['/admin/item']);
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
