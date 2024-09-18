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
  selector: 'app-add-edit-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxFileDropModule, TranslateModule],
  templateUrl: './add-edit-customer.component.html',
  styleUrl: './add-edit-customer.component.css'
})
export class AddEditCustomerComponent {
  @Input('isChild') isChild: boolean = false;
  private ngUnsubscribe = new Subject<void>();
  customerForm!: FormGroup;
  isEdit: boolean = false;
  selectedCustomer: any;
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
      this.selectedCustomer = {};
      if (params['customerId'] !== undefined && params['customerId'] !== null && params['customerId'] !== '' && params['customerId'] !== 0) {
        this.isEdit = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedCustomer = JSON.parse(localStorage.getItem('tempCustomer')!);
        }

      }
    });

    this.customerForm = this._fb.group(
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

    this.customerForm.patchValue({
      name: this.selectedCustomer.name,
      address: this.selectedCustomer.address,
      representativeName: this.selectedCustomer.representativeName,
      computerNumber: this.selectedCustomer.computerNumber,
      commercialRegistration: this.selectedCustomer.commercialRegistration,
      chamberOfCommerce: this.selectedCustomer.chamberOfCommerce,
      vatNumber: this.selectedCustomer.vatNumber,
      municipalityNumber: this.selectedCustomer.municipalityNumber,
      phoneNumber: this.selectedCustomer.phoneNumber,

    })
  }

  ngOnInit(): void {
    this.prefilledForm();
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tempCustomer');
    }

  }

  submitForm(): void {
    if (!this.customerForm.valid) {
      return;
    }

    if (!this.isEdit) {
      var formData = new FormData();
      formData.append('name', this.customerForm.get('name')?.value);
      formData.append('address', this.customerForm.get('address')?.value);
      formData.append('representativeName', this.customerForm.get('representativeName')?.value);
      formData.append('computerNumber', this.customerForm.get('computerNumber')?.value);
      formData.append('commercialRegistration', this.customerForm.get('commercialRegistration')?.value);
      formData.append('chamberOfCommerce', this.customerForm.get('chamberOfCommerce')?.value);
      formData.append('vatNumber', this.customerForm.get('vatNumber')?.value);
      formData.append('municipalityNumber', this.customerForm.get('municipalityNumber')?.value);
      formData.append('phoneNumber', this.customerForm.get('phoneNumber')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      this.attachedFiles.forEach(function (obj: any, index: any) {
        formData.append(`attachments`, obj.file);
      });

      this._apiCalling.postData("customer", "add", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              if (!this.isChild) {
                this.backToCustomers();
              } else {
                this._dataShare.shareCustomerId(response?.data?.customerId);
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
      formData.append('name', this.customerForm.get('name')?.value);
      formData.append('address', this.customerForm.get('address')?.value);
      formData.append('representativeName', this.customerForm.get('representativeName')?.value);
      formData.append('computerNumber', this.customerForm.get('computerNumber')?.value);
      formData.append('commercialRegistration', this.customerForm.get('commercialRegistration')?.value);
      formData.append('chamberOfCommerce', this.customerForm.get('chamberOfCommerce')?.value);
      formData.append('vatNumber', this.customerForm.get('vatNumber')?.value);
      formData.append('municipalityNumber', this.customerForm.get('municipalityNumber')?.value);
      formData.append('phoneNumber', this.customerForm.get('phoneNumber')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      this.attachedFiles.forEach(function (obj: any, index: any) {
        formData.append(`attachments`, obj.file);
      });

      this._apiCalling.putData("customer", "edit/" + this.selectedCustomer.customerId + "", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.backToCustomers();

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

  backToCustomers(): void {
    this._router.navigate([`${'/configuration/customers'}`]);
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
