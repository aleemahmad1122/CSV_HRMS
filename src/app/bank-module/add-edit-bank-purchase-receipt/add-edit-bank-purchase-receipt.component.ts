import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { DataShareService } from '../../shared/Services/data-share.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { AddEditSupplierComponent } from '../../configuration-module/add-edit-supplier/add-edit-supplier.component';
import { AddEditBankComponent } from '../../configuration-module/add-edit-bank/add-edit-bank.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;

@Component({
  selector: 'app-add-edit-bank-purchase-receipt',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule, AddEditSupplierComponent, NgbDatepickerModule, AddEditBankComponent, NgSelectModule, TranslateModule],
  templateUrl: './add-edit-bank-purchase-receipt.component.html',
  styleUrl: './add-edit-bank-purchase-receipt.component.css'
})
export class AddEditBankPurchaseReceiptComponent {
  files: NgxFileDropEntry[] = [];
  imageObject: any = [];
  ngUnsubscribe = new Subject<void>();
  _subscription: Subscription;
  bankReceiptForm!: FormGroup;
  isEdit: boolean = false;
  selectedBankReceipt: any;
  attachedFiles: any[] = [];
  bankList: any[] = [];
  supplierList: any[] = [];
  managerList: any[] = [];
  selectedFile: any;

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private _dataShare: DataShareService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.selectedBankReceipt = {};
      if (params['receiptId'] !== undefined && params['receiptId'] !== null && params['receiptId'] !== '' && params['receiptId'] !== 0) {
        this.isEdit = true;
        this.isEdit = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedBankReceipt = JSON.parse(localStorage.getItem('bank')!);
        }

      }
    });

    this._subscription = this._dataShare.$shareSupplierId.subscribe(supplierId => {
      if (supplierId !== 0) {
        this.getSupplier(supplierId);
      }
    });


    this._subscription = this._dataShare.$shareBankId.subscribe(bankId => {
      if (bankId !== 0) {
        this.getBank(bankId);
      }
    });

    this.bankReceiptForm = this._fb.group(
      {
        receiptDate: [new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())],
        receiptNumber: ['', [Validators.required]],
        selectedId: ['', [Validators.required]],
        bankId: ['', [Validators.required]],
        assignedTo: ['', [Validators.required]],
        amount: ['', [Validators.required]],
        remarks: ['']
      });

  }

  ngOnInit(): void {
    this.getSupplier(0);
    this.getBank(0);
    this.getManager();
    this.prefilledForm();
  }


  prefilledForm(): void {
    if (!this.isEdit)
      return;

    this.bankReceiptForm.patchValue({
      receiptDate: new NgbDate(new Date(this.selectedBankReceipt.receiptDate).getFullYear(), new Date(this.selectedBankReceipt.receiptDate).getMonth() + 1, new Date(this.selectedBankReceipt.receiptDate).getDate()),
      receiptNumber: this.selectedBankReceipt.receiptNumber,
      selectedId: this.selectedBankReceipt.id,
      assignedTo: this.selectedBankReceipt.assignedTo,
      bankId: this.selectedBankReceipt.bankId,
      amount: this.selectedBankReceipt.amount,
      remarks: this.selectedBankReceipt.remarks
    });
    this.selectedBankReceipt?.bankReceiptMediaInformation.forEach((element: any) => {
      this.attachedFiles.push({
        name: element.fileName,
        url: this._sanitizer.bypassSecurityTrustResourceUrl(element.mediaUrl)
      })
    });
    this.getSelectedFile(0);
  }

  getSupplier(supplierId: any): void {
    this._apiCalling.getData("supplier", "", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.supplierList = response.data;
            this.supplierList.push({ supplierId: 0, name: 'Other' });
            if (supplierId !== 0) {
              this.bankReceiptForm.controls['selectedId'].setValue(supplierId);
              $('#addSupplierModal').modal('hide');
            }
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  getBank(bankId: any): void {
    this._apiCalling.getData("bankReceipt", "getBanks", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.bankList = response.data;
            this.bankList.push({ bankId: 0, title: 'Other' });
            if (bankId !== 0) {
              this.bankReceiptForm.controls['bankName'].setValue(bankId);
              $('#addBankModal').modal('hide');
            }
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  getManager(): void {
    this._apiCalling.getData("user", "manager", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.managerList = response.data;
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('bank');
    }

  }

  submitForm(): void {
    if (!this.bankReceiptForm.valid) {
      return;
    }

    if (!this.isEdit) {
      var formData = new FormData();
      formData.append('receiptType', '1');
      formData.append('receiptDate', `${this.bankReceiptForm.get('receiptDate')?.value.year}-${this.bankReceiptForm.get('receiptDate')?.value.month}-${this.bankReceiptForm.get('receiptDate')?.value.day}`);
      formData.append('receiptNumber', this.bankReceiptForm.get('receiptNumber')?.value);
      formData.append('selectedId', this.bankReceiptForm.get('selectedId')?.value);
      formData.append('bankId', this.bankReceiptForm.get('bankId')?.value);
      formData.append('amount', this.bankReceiptForm.get('amount')?.value);
      formData.append('assignedTo', this.bankReceiptForm.get('assignedTo')?.value);
      formData.append('remarks', this.bankReceiptForm.get('remarks')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      this.attachedFiles.forEach(function (obj: any, index: any) {
        formData.append(`attachments`, obj.file);
      });

      this._apiCalling.postData("bankReceipt", "add", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.back();

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
      formData.append('receiptType', '1');
      formData.append('receiptDate', `${this.bankReceiptForm.get('receiptDate')?.value.year}-${this.bankReceiptForm.get('receiptDate')?.value.month}-${this.bankReceiptForm.get('receiptDate')?.value.day}`);
      formData.append('selectedId', this.bankReceiptForm.get('selectedId')?.value);
      formData.append('receiptNumber', this.bankReceiptForm.get('receiptNumber')?.value);
      formData.append('bankId', this.bankReceiptForm.get('bankId')?.value);
      formData.append('amount', this.bankReceiptForm.get('amount')?.value);
      formData.append('assignedTo', this.bankReceiptForm.get('assignedTo')?.value);
      formData.append('remarks', this.bankReceiptForm.get('remarks')?.value);
      formData.append('actionBy', String(this._authService.getUserId()));
      this.attachedFiles.forEach(function (obj: any, index: any) {
        formData.append(`attachments`, obj.file);
      });

      this._apiCalling.putData("bankReceipt", "edit/" + this.selectedBankReceipt.receiptId + "", formData, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.back();

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

  droppedFiles(files: NgxFileDropEntry[]) {
    this.files = files;
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

  addCustomerModal(): void {
    if (this.bankReceiptForm.get('selectedId')?.value === '')
      return;

    if (Number(this.bankReceiptForm.get('selectedId')?.value) === 0) {
      $('#addCustomerModal').modal('show');
    }
  }

  addSupplierModal(): void {
    if (this.bankReceiptForm.get('selectedId')?.value === '')
      return;

    if (Number(this.bankReceiptForm.get('selectedId')?.value) === 0) {
      $('#addSupplierModal').modal('show');
    }
  }

  addBankModal(): void {
    if (this.bankReceiptForm.get('bankId')?.value === '')
      return;

    if (Number(this.bankReceiptForm.get('bankId')?.value) === 0) {
      $('#addBankModal').modal('show');
    }
  }

  removeAttachment(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  back(): void {
    this._router.navigate([`${'/bank/bank-purchase-receipts'}`]);
  }

}
