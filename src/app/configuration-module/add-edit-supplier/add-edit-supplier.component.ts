import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { DataShareService } from '../../shared/Services/data-share.service';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-edit-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxFileDropModule, TranslateModule],
  templateUrl: './add-edit-supplier.component.html',
  styleUrl: './add-edit-supplier.component.css'
})
export class AddEditSupplierComponent {
  @Input('isChild') isChild: boolean = false;
  private ngUnsubscribe = new Subject<void>();
  SupplierForm!: FormGroup;
  isEdit: boolean = false;
  selectedSupplier: any;
  locations: any[] = [];
  attachedFiles: any[] = [];
  selectedFile: any;

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _route: ActivatedRoute,
    private _dataShare: DataShareService,
    private _sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.selectedSupplier = {};
      if (params['supplierId'] !== undefined && params['supplierId'] !== null && params['supplierId'] !== '' && params['supplierId'] !== 0) {
        this.isEdit = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedSupplier = JSON.parse(localStorage.getItem('tempSupplier')!);
        }

      }
    });

    this.SupplierForm = this._fb.group(
      {
        name: ['', [Validators.required]],
        address: [''],
        representativeName: [''],
        computerNumber: [''],
        commercialRegistration: ['', [Validators.required]],
        chamberOfCommerce: [''],
        phoneNumber: [''],
        vatNumber: ['', [Validators.required]],
        municipalityNumber: [''],
      }
    );

  }

  prefilledForm(): void {
    if (!this.isEdit)
      return;

    this.SupplierForm.patchValue({
      name: this.selectedSupplier.name,
      address: this.selectedSupplier.address,
      representativeName: this.selectedSupplier.representativeName,
      computerNumber: this.selectedSupplier.computerNumber,
      commercialRegistration: this.selectedSupplier.commercialRegistration,
      chamberOfCommerce: this.selectedSupplier.chamberOfCommerce,
      vatNumber: this.selectedSupplier.vatNumber,
      municipalityNumber: this.selectedSupplier.municipalityNumber,
      phoneNumber: this.selectedSupplier.phoneNumber
    })
  }

  ngOnInit(): void {
    this.prefilledForm();
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tempSupplier');
    }

  }

  submitForm(): void {
    if (!this.SupplierForm.valid) {
      return;
    }

    if (!this.isEdit) {
      var formData = new FormData();
      formData.append('name', this.SupplierForm.get('name')?.value);
      formData.append('address', this.SupplierForm.get('address')?.value);
      formData.append('representativeName', this.SupplierForm.get('representativeName')?.value);
      formData.append('computerNumber', this.SupplierForm.get('computerNumber')?.value);
      formData.append('commercialRegistration', this.SupplierForm.get('commercialRegistration')?.value);
      formData.append('chamberOfCommerce', this.SupplierForm.get('chamberOfCommerce')?.value);
      formData.append('vatNumber', this.SupplierForm.get('vatNumber')?.value);
      formData.append('municipalityNumber', this.SupplierForm.get('municipalityNumber')?.value);
      formData.append('phoneNumber', this.SupplierForm.get('phoneNumber')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      this.attachedFiles.forEach(function (obj: any, index: any) {
        formData.append(`attachments`, obj.file);
      });
      this._apiCalling.postData("supplier", "add", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              if (!this.isChild) {
                this.backToUsers();
              } else {
                this._dataShare.shareSupplierId(response?.data?.supplierId);
              }
            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    } else {
      var formData = new FormData();
      formData.append('name', this.SupplierForm.get('name')?.value);
      formData.append('address', this.SupplierForm.get('address')?.value);
      formData.append('representativeName', this.SupplierForm.get('representativeName')?.value);
      formData.append('computerNumber', this.SupplierForm.get('computerNumber')?.value);
      formData.append('commercialRegistration', this.SupplierForm.get('commercialRegistration')?.value);
      formData.append('chamberOfCommerce', this.SupplierForm.get('chamberOfCommerce')?.value);
      formData.append('vatNumber', this.SupplierForm.get('vatNumber')?.value);
      formData.append('municipalityNumber', this.SupplierForm.get('municipalityNumber')?.value);
      formData.append('phoneNumber', this.SupplierForm.get('phoneNumber')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      this.attachedFiles.forEach(function (obj: any, index: any) {
        formData.append(`attachments`, obj.file);
      });
      this._apiCalling.putData("supplier", "edit/" + this.selectedSupplier.supplierId + "", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.backToUsers();

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

  backToUsers(): void {
    this._router.navigate([`${'/configuration/suppliers'}`]);
  }

  droppedFiles(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const arrayBuffer = e.target.result as ArrayBuffer;
            const fileBlob = new Blob([new Uint8Array(arrayBuffer)], { type: file?.type });
            this.attachedFiles.push(
              {
                file: file,
                name: file.name,
                type: file.type,
                fileBlob: fileBlob,
                url: this._sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(fileBlob))
              }

            );
            console.log('File Blob:', fileBlob);
          };
          reader.readAsArrayBuffer(file);
        });
      }
    }
    this.getSelectedFile(0);
  }

  getSelectedFile(index: number): void {
    this.selectedFile = this.attachedFiles[index];
  }

  removeAttachment(index: number): void {
    this.attachedFiles.splice(index, 1);
  }
}
