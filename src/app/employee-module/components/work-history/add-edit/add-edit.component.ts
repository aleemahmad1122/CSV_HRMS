import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../../../shared/Services/user-authentication.service';
import { NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { IAttachmentType, IAttachmentTypeRes, ICompany } from '../../../../types';
declare const $: any;



@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule, TranslateModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent {
  employeeWorkhistoryForm!: FormGroup;
  isEditMode: boolean | string = false;
  attachmentTypes: IAttachmentType[] = [];
  isSubmitted = false;

  files: NgxFileDropEntry[] = [];
  imageObject: any = [];
  ngUnsubscribe = new Subject<void>();
  expenseForm!: FormGroup;
  expenseSubmissionForm!: FormGroup;
  expenseMainForm!: FormGroup;
  isEdit: boolean = false;
  isEditPermanently: boolean = false;
  selectedExpense: any;
  attachedFile: any = null;
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
  itemAttachment: any = null;

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object) {

    this.expenseSubmissionForm = this._fb.group({
      assignedTo: ['', [Validators.required]],
    });

    this.expenseMainForm = this._fb.group({
      expenseAllItem: this._fb.array([])
    });

    this.addWorkHistoryItem();
  }

  ngOnInit(): void {
    this.getAttachmentTypes();
  }

  get expenseAllItem(): FormArray {
    return this.expenseMainForm.controls["expenseAllItem"] as FormArray;
  }

  convertExpenseForm(form: any): FormGroup {
    return form as FormGroup;
  }

  getAttachmentTypes() {
    this._apiCalling.getData("AttachmentType", `getAttachmentType`, true).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.attachmentTypes = response.data.attachmentTypes;
        } else {
          this._toaster.error('No attachment types found', 'Error!');
        }
      },
      error: () => {
        this._toaster.error('Error fetching company details', 'Error!');
      }
    });
  }

  addWorkHistoryItem() {
    const expenseItemForm = this._fb.group(
      {
        attachmentTypeId: ['', [Validators.required]],
        workHistoryDocument: [null, [Validators.required]],
        positionTitle: ['', [Validators.required]],
        organization: ['', [Validators.required]],
        startDate: [new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())],
        endDate: [new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())],
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
    this.attachedFile = null;
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
        this.attachedFile.push({
          name: element.fileName,
          url: this._sanitizer.bypassSecurityTrustResourceUrl(element.mediaUrl)
        })
      });

      this.getSelectedFile();
    }
    this.selectedIndex = index;
    this.isEdit = true;
    this.showAddingInput = true;

  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('expense');
    }

  }

  submitForm(): void {
    if (!this.expenseMainForm.valid) {
      return;
    }

    const formData = new FormData();
    this.expenseAllItem.controls.forEach((control: FormGroup) => {
      const attachmentTypeId = control.get('attachmentTypeId')?.value;
      const workHistoryDocument = control.get('workHistoryDocument')?.value;
      const positionTitle = control.get('positionTitle')?.value;
      const organization = control.get('organization')?.value;
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;

      formData.append('attachmentTypeId', attachmentTypeId);
      formData.append('workHistoryDocument', workHistoryDocument);
      formData.append('positionTitle', positionTitle);
      formData.append('organization', organization);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
    });

    this._apiCalling.postData("EmployeeWorkHistory", "addEmployeeWorkHistory", formData, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occurred while processing your request");
        }
      });
  }


  droppedFiles(files: NgxFileDropEntry[]) {
    if (files.length === 0) return;

    const droppedFile = files[0]; // Only take the first file
    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const fileBlob = new Blob([new Uint8Array(arrayBuffer)], { type: file?.type });
          this.attachedFile = {
            file: file,
            name: file.name,
            type: file.type,
            fileBlob: fileBlob,
            url: this._sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(fileBlob))
          };
        };
        reader.readAsArrayBuffer(file);
      });
    }
  }



  getSelectedFile(): void {
    this.selectedFile = this.attachedFile;
  }

  removeAttachment(): void {
    this.attachedFile = null;
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



  onSubmit(): void {
    // if (!this.expenseSubmissionForm.valid) {
    //   return;
    // }

    const formData = new FormData();
    const formArray = this.expenseMainForm.get('expenseAllItem') as FormArray;

    formArray.value.forEach((expenseElement: any) => {

      const workHistoryItem = {
        attachmentTypeId: expenseElement.attachmentTypeId,
        workHistoryDocument: this.itemAttachment?.file,
        positionTitle: expenseElement.positionTitle,
        organization: expenseElement.organization,
        startDate: expenseElement.startDate,
        endDate: expenseElement.endDate
      };

      formData.append('employeeWorkHistories', JSON.stringify(workHistoryItem));
    });

    this._apiCalling.postData("EmployeeWorkHistory", "addEmployeeWorkHistory", formData, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $('#saveBatchConfirmationModal').modal('hide');
            this.back();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: () => {
          this._toaster.error("Internal server error occurred while processing your request");
        }
      });
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
    this.attachedFile = [];
    this.attachmentIndex = index;
    $("#uploadAttachmentModal").modal('show');
  }



  saveItemAttachment(): void {

    if (this.attachedFile) {
      this.itemAttachment =  this.attachedFile;
    }
    $("#uploadAttachmentModal").modal('hide');
    this.attachedFile = null;
  }

}
