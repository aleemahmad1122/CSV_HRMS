import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;
@Component({
  selector: 'app-add-edit-expense-sheet',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule, TranslateModule],
  templateUrl: './add-edit-expense-sheet.component.html',
  styleUrl: './add-edit-expense-sheet.component.css'
})

export class AddEditExpenseSheetComponent {
  files: NgxFileDropEntry[] = [];
  imageObject: any = [];
  ngUnsubscribe = new Subject<void>();
  expenseForm!: FormGroup;
  expenseSubmissionForm!: FormGroup;
  expenseMainForm!: FormGroup;
  isEdit: boolean = false;
  isEditPermanently: boolean = false;
  selectedExpense: any;
  attachedFiles: any[] = [];
  managerList: any[] = [];
  selectedFile: any;
  expenseItems: any[] = [];
  showAddingInput: boolean = true;
  selectedIndex = -1;
  expenseSubDetailId = 0;
  isViewOnly: boolean = false;
  isUserRole: boolean = true;
  changeStatusObj: any = {};
  remarksList: any[] = [];
  itemAttachment: any[] = [];

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.isUserRole = _authService.getUserRole() === 3 ? true : false;
    this._route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.isEditPermanently = false;
      this.selectedExpense = {};
      if (params['expenseId'] !== undefined && params['expenseId'] !== null && params['expenseId'] !== '' && Number(params['expenseId']) !== 0) {
        this.isEdit = true;
        this.isEditPermanently = true;

        if (isPlatformBrowser(this.platformId)) {
          this.selectedExpense = JSON.parse(localStorage.getItem('expense')!);
        }

        this.showAddingInput = false;
        this.expenseItems = this.selectedExpense?.expenseSubInformation == undefined ? this.selectedExpense : this.selectedExpense?.expenseSubInformation;
      }

      if (params['isView'] !== undefined && params['isView'] !== null && params['isView'] !== '' && Number(params['isView']) !== 0) {
        this.isViewOnly = true;
      }
    });

    this.expenseSubmissionForm = this._fb.group({
      assignedTo: ['', [Validators.required]],
    });

    this.expenseMainForm = this._fb.group({
      expenseAllItem: this._fb.array([])
    });

    this.addExpenseItem();
  }

  ngOnInit(): void {
    this.getManager();
  }

  get expenseAllItem(): FormArray {
    return this.expenseMainForm.controls["expenseAllItem"] as FormArray;
  }

  convertExpenseForm(form: any): FormGroup {
    return form as FormGroup;
  }

  addExpenseItem() {
    const expenseItemForm = this._fb.group(
      {
        receiptDate: [new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())],
        documentNumber: ['', [Validators.required]],
        costCenter: [''],
        totalBeforeVat: ['', [Validators.required]],
        vat: ['15', [Validators.required]],
        totalWithVat: ['', [Validators.required]],
        remarks: [''],
      });
    this.expenseAllItem.push(expenseItemForm);
  }

  deleteLesson(index: number) {
    this.expenseAllItem.removeAt(index);
  }

  resetForm(): void {
    this.expenseForm.patchValue({
      receiptDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
      documentNumber: '',
      costCenter: '',
      totalBeforeVat: '',
      vat: '15',
      totalWithVat: '',
      remarks: '',
    });
    this.attachedFiles = [];
    this.selectedIndex = -1;
    this.isEdit = false;
    this.isViewOnly = false;
  }

  editExpenseForm(expense: any, index: number): void {
    this.expenseForm.patchValue({
      receiptDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
      documentNumber: expense.documentNumber,
      costCenter: expense.costCenter,
      totalBeforeVat: expense.totalBeforeVat,
      vat: expense.vat,
      totalWithVat: expense.totalWithVat,
      remarks: expense.remarks,

    });
    if (expense?.expenseMediaInformation?.length > 0) {
      expense?.expenseMediaInformation.forEach((element: any) => {
        this.attachedFiles.push({
          name: element.fileName,
          url: this._sanitizer.bypassSecurityTrustResourceUrl(element.mediaUrl)
        })
      });

      this.getSelectedFile(0);
    }
    this.selectedIndex = index;
    this.isEdit = true;
    this.showAddingInput = true;

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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('expense');
    }

  }

  submitForm(): void {
    if (!this.expenseForm.valid) {
      return;
    }

    if (!this.isEdit) {
      this.expenseItems.push({
        date: new Date(),
        receiptDate: `${this.expenseForm.get('receiptDate')?.value.year}-${this.expenseForm.get('receiptDate')?.value.month}-${this.expenseForm.get('receiptDate')?.value.day}`,
        documentNumber: this.expenseForm.get('documentNumber')?.value,
        costCenter: this.expenseForm.get('costCenter')?.value,
        totalBeforeVat: this.expenseForm.get('totalBeforeVat')?.value,
        vat: this.expenseForm.get('vat')?.value,
        totalWithVat: this.expenseForm.get('totalWithVat')?.value,
        remarks: this.expenseForm.get('remarks')?.value,
        attachments: this.attachedFiles.length > 0 ? this.attachedFiles : 0
      });
      this.attachedFiles = [];
      this.showAddingInput = false;
    } else {
      this.expenseItems[this.selectedIndex].date = new Date();
      this.expenseItems[this.selectedIndex].receiptDate = `${this.expenseForm.get('receiptDate')?.value.year}-${this.expenseForm.get('receiptDate')?.value.month}-${this.expenseForm.get('receiptDate')?.value.day}`;
      this.expenseItems[this.selectedIndex].documentNumber = this.expenseForm.get('documentNumber')?.value;
      this.expenseItems[this.selectedIndex].costCenter = this.expenseForm.get('costCenter')?.value;
      this.expenseItems[this.selectedIndex].totalBeforeVat = this.expenseForm.get('totalBeforeVat')?.value;
      this.expenseItems[this.selectedIndex].vat = this.expenseForm.get('vat')?.value;
      this.expenseItems[this.selectedIndex].totalWithVat = this.expenseForm.get('totalWithVat')?.value;
      this.expenseItems[this.selectedIndex].remarks = this.expenseForm.get('remarks')?.value;
      this.expenseItems[this.selectedIndex].attachments = this.attachedFiles;
      if (this.isEditPermanently) {
        var formData = new FormData();
        formData.append(`receiptDate`, this.expenseItems[this.selectedIndex].receiptDate);
        formData.append(`documentNumber`, this.expenseItems[this.selectedIndex].documentNumber);
        formData.append(`costCenter`, this.expenseItems[this.selectedIndex].costCenter);
        formData.append(`totalBeforeVat`, this.expenseItems[this.selectedIndex].totalBeforeVat);
        formData.append(`vat`, this.expenseItems[this.selectedIndex].vat);
        formData.append(`totalWithVat`, this.expenseItems[this.selectedIndex].totalWithVat);
        formData.append(`remarks`, this.expenseItems[this.selectedIndex].remarks);
        formData.append(`actionBy`, String(this._authService.getUserId()));
        if (this.attachedFiles.length > 0) {
          this.attachedFiles.forEach(function (attachment: any) {
            formData.append(`attachments`, attachment.file);
          });
        }

        this._apiCalling.putData("expense", `edit/${this.expenseItems[this.selectedIndex].expenseSubDetailId}`, formData, true)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this._toaster.success(response?.message, 'Success!');
                this.expenseItems[this.selectedIndex] = response.data;
              } else {
                this._toaster.error(response?.message, 'Error!');
              }
            },
            error: (error) => {
              this._toaster.error("Internal server error occured while processing your request")
            }
          })
      }
      this.attachedFiles = [];
      this.showAddingInput = false;
      this.isEdit = this.isEditPermanently;
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

  removeAttachment(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  removeExpenseEntry(expense: any, index: number): void {
    this.selectedIndex = index;
    this.expenseSubDetailId = expense.expenseSubDetailId;
    if (!this.isEdit) {
      this.expenseItems.splice(index, 1);
    } else {
      $("#deleteConfirmationModal").modal('show');
    }

  }

  saveBatch(): void {
    debugger
    if (!this.expenseSubmissionForm.valid) {
      return;
    }

    var formData = new FormData();
    var ref = this;
    //.controls[0].controls.receiptDate.value
    var formArray = this.expenseMainForm.get('expenseAllItem') as FormArray;
    formArray.value.forEach(function (expenseElement: any, expenseElementIndex: any) {
      formData.append(`request[${expenseElementIndex}].receiptDate`, `${expenseElement.receiptDate.year}-${expenseElement.receiptDate.month}-${expenseElement.receiptDate.day}`);
      formData.append(`request[${expenseElementIndex}].documentNumber`, expenseElement.documentNumber);
      formData.append(`request[${expenseElementIndex}].costCenter`, expenseElement.costCenter);
      formData.append(`request[${expenseElementIndex}].totalBeforeVat`, expenseElement.totalBeforeVat);
      formData.append(`request[${expenseElementIndex}].vat`, expenseElement.vat);
      formData.append(`request[${expenseElementIndex}].totalWithVat`, expenseElement.totalWithVat);
      formData.append(`request[${expenseElementIndex}].remarks`, expenseElement.remarks);
      formData.append(`request[${expenseElementIndex}].assignedTo`, ref.expenseSubmissionForm.get('assignedTo')?.value);
      formData.append(`request[${expenseElementIndex}].actionBy`, String(ref._authService.getUserId()));
      var attachment = ref.itemAttachment.filter((x: any) => x.index === expenseElementIndex)[0];
      if (attachment !== undefined) {
        if (attachment.attachments.length > 0) {
          attachment.attachments.forEach(function (attachment: any, attachmentIndex: any) {
            formData.append(`request[${expenseElementIndex}].attachments`, attachment.file);
          });
        }
      }

    });

    this._apiCalling.postData("expense", "add", formData, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $('#saveBatchConfirmationModal').modal('hide');
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

  back(): void {
    this._router.navigate([`${'/expense/expense-sheet'}`]);
  }

  calculateTotal(expenseItemForm: any): void {
    var total = Math.floor(Number(expenseItemForm.get('totalBeforeVat')?.value) + ((expenseItemForm.get('totalBeforeVat')?.value) * (Number(expenseItemForm.get('vat')?.value) / 100)));
    expenseItemForm.patchValue({
      totalWithVat: total,
    });
  }

  openCofirmationModal(): void {
    if (!this.expenseMainForm.valid) {
      return;
    }
    this.expenseSubmissionForm.patchValue({
      assignedTo: '',
    });
    $('#saveBatchConfirmationModal').modal('show');
  }

  deleteExpense(): void {
    this._apiCalling.deleteData("expense", `deleteSubExpenseItem/${this.expenseSubDetailId}`,
      {
        "actionBy": this._authService.getUserId()
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            if (isPlatformBrowser(this.platformId)) {
              localStorage.removeItem('expense');
              localStorage.setItem('expense', JSON.stringify(response?.data));
            }
            this.expenseItems = response?.data;
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  changeStatus(event: any, expenseSubDetailId: number): void {
    this.remarksList = [];
    this.changeStatusObj = {};
    this.changeStatusObj.remarks = '';
    this.changeStatusObj.expenseSubDetailId = expenseSubDetailId;
    this.changeStatusObj.status = Number(event?.target?.value);
    this.changeStatusObj.actionBy = this._authService.getUserId();
    $("#remarksModal").modal('show');
  }

  saveRemarks(): void {
    this.changeStatusObj.remarks = this.changeStatusObj.remarks.trim();
    this._apiCalling.postData("expense", "saveExpenseItemRemarks", this.changeStatusObj, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.removeItem('expense');
              localStorage.setItem('expense', JSON.stringify(response?.data));
            }
            this.expenseItems = response?.data;
            this._toaster.success(response?.message, 'Success!');
            $("#remarksModal").modal('hide');
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  viewRemarksHistory(expense: any): void {
    this._apiCalling.getData("expense", `getExpenseItemRemarks/${expense.expenseSubDetailId}`, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.remarksList = response.data;
            if (this.remarksList.length > 0) {
              $("#remarksModal").modal('show');
            } else {
              this._toaster.error('No Remarks Added', 'Error!');
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
  attachmentIndex: number = -1;
  openUploadModal(index: any): void {
    this.attachedFiles = [];
    this.attachmentIndex = index;
    $("#uploadAttachmentModal").modal('show');
  }

  saveItemAttachment(): void {
    if (this.attachedFiles.length > 0) {
      this.itemAttachment.push({
        index: this.attachmentIndex,
        attachments: this.attachedFiles
      });
    }
    $("#uploadAttachmentModal").modal('hide');
    this.attachedFiles = [];
  }

}
