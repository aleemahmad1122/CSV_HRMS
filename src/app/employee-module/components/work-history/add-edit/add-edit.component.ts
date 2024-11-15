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
import { IAttachmentTypeRes, IAttachmentType } from "../../../../types/index";
declare const $: any;



@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule, TranslateModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent {
  files: NgxFileDropEntry[] = [];
  imageObject: any = [];
  ngUnsubscribe = new Subject<void>();
  rowForm!: FormGroup;
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
  attachmentTypes: IAttachmentType[] = [];

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object) {

    this._route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.isEditPermanently = false;
      this.selectedExpense = {};
      if (params['id'] !== undefined && params['id'] !== null && params['id'] !== '' && Number(params['id']) !== 0) {
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

    this.expenseMainForm = this._fb.group({
      expenseAllItem: this._fb.array([])
    });

    this.addRow();
  }

  ngOnInit(): void {
    this.getAttachmentTypes()
  }


  private getAttachmentTypes() {
    this._apiCalling.getData("AttachmentType", `getAttachmentType`, true).subscribe({
      next: (response: IAttachmentTypeRes) => {
        if (response?.success) {
          this.attachmentTypes = response.data.attachmentTypes;
          console.log(response.data.attachmentTypes);

        } else {
          this._toaster.error('No attachment types found', 'Error!');
        }
      },
      error: () => {
        this._toaster.error('Error fetching company details', 'Error!');
      }
    });
  }


  get expenseAllItem(): FormArray {
    return this.expenseMainForm.controls["expenseAllItem"] as FormArray;
  }

  convertRowForm(form: any): FormGroup {
    return form as FormGroup;
  }

  addRow() {
    const expenseItemForm = this._fb.group(
      {
        positionTitle: ['', [Validators.required]],
        organization: [''],
        attachmentTypeId: [''],
        attachment: [''],
        startDate: [''],
        endDate: [''],
      });
    this.expenseAllItem.push(expenseItemForm);
  }

  deleteLesson(index: number) {
    console.log(index);

    this.expenseAllItem.removeAt(index);
  }

  resetForm(): void {
    this.rowForm.reset();
    this.attachedFiles = [];
    this.selectedIndex = -1;
    this.isEdit = false;
    this.isViewOnly = false;
  }

  editExpenseForm(expense: any, index: number): void {
    this.rowForm.patchValue({
      receiptDate: new NgbDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
      documentNumber: expense.documentNumber,
      costCenter: expense.costCenter,
      totalBeforeVat: expense.totalBeforeVat,
      vat: expense.vat,
      totalWithVat: expense.totalWithVat,

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



  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('expense');
    }

  }

  submitForm(): void {
    if (!this.rowForm.valid) {
      return;
    }

    if (!this.isEdit) {
      this.expenseItems.push({
        attachmentTypeId: this.rowForm.get('attachmentTypeId').value,
        positionTitle: this.rowForm.get('positionTitle')?.value,
        organization: this.rowForm.get('organization')?.value,
        startDate: `${this.rowForm.get('startDate')?.value.year}-${this.rowForm.get('startDate')?.value.month}-${this.rowForm.get('startDate')?.value.day}`,
        endDate: `${this.rowForm.get('endDate')?.value.year}-${this.rowForm.get('endDate')?.value.month}-${this.rowForm.get('startDate')?.value.day}`,
        attachment: this.attachedFiles.length > 0 ? this.attachedFiles : 0
      });
      this.attachedFiles = [];
      this.showAddingInput = false;
    } else {
      this.expenseItems[this.selectedIndex].attachmentTypeId = this.rowForm.get('attachmentTypeId').value;
      this.expenseItems[this.selectedIndex].positionTitle = this.rowForm.get('positionTitle')?.value;
      this.expenseItems[this.selectedIndex].organization = this.rowForm.get('organization')?.value;
      this.expenseItems[this.selectedIndex].startDate = `${this.rowForm.get('startDate')?.value.year}-${this.rowForm.get('startDate')?.value.month}-${this.rowForm.get('startDate')?.value.day}`;
      this.expenseItems[this.selectedIndex].endDate = `${this.rowForm.get('endDate')?.value.year}-${this.rowForm.get('endDate')?.value.month}-${this.rowForm.get('startDate')?.value.day}`;
      this.expenseItems[this.selectedIndex].attachment = this.attachedFiles;
      if (this.isEditPermanently) {
        var formData = new FormData();
        formData.append(`attachmentTypeId`, this.expenseItems[this.selectedIndex].attachmentTypeId);
        formData.append(`positionTitle`, this.expenseItems[this.selectedIndex].positionTitle);
        formData.append(`organization`, this.expenseItems[this.selectedIndex].organization);
        formData.append(`startDate`, this.expenseItems[this.selectedIndex].startDate);
        formData.append(`endDate`, this.expenseItems[this.selectedIndex].endDate);
        if (this.attachedFiles.length > 0) {
          this.attachedFiles.forEach(function (attachment: any) {
            formData.append(`attachment`, attachment.file);
          });
        }

        this._apiCalling.putData("EmployeeWorkHistory", `updateEmployeeWorkHistory/${this.expenseItems[this.selectedIndex].id}`, formData, true)
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

  onSubmit(): void {
    // if (!this.expenseSubmissionForm.valid) {
    //   return;
    // }

    var formData = new FormData();
    var ref = this;
    //.controls[0].controls.receiptDate.value
    var formArray = this.expenseMainForm.get('expenseAllItem') as FormArray;
    formArray.value.forEach(function (expenseElement: any, expenseElementIndex: any) {
      formData.append(`workHistoryRequest[${expenseElementIndex}].attachmentTypeId`, expenseElement.attachmentTypeId);
      formData.append(`workHistoryRequest[${expenseElementIndex}].positionTitle`, expenseElement.positionTitle);
      formData.append(`workHistoryRequest[${expenseElementIndex}].organization`, expenseElement.organization);
      formData.append(`workHistoryRequest[${expenseElementIndex}].startDate`, `${expenseElement.startDate.year}-${expenseElement.startDate.month}-${expenseElement.startDate.day}`);
      formData.append(`workHistoryRequest[${expenseElementIndex}].endDate`, `${expenseElement.endDate.year}-${expenseElement.endDate.month}-${expenseElement.endDate.day}`);
      var attachment = ref.itemAttachment.filter((x: any) => x.index === expenseElementIndex)[0];
      if (attachment !== undefined) {
        if (attachment.attachments.length > 0) {
          attachment.attachments.forEach(function (attachment: any, attachmentIndex: any) {
            formData.append(`workHistoryRequest[${expenseElementIndex}].attachments`, attachment.file);
          });
        }
      }

    });

    this._apiCalling.postData("EmployeeWorkHistory", "addEmployeeWorkHistory", formData, true)
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
    this._router.navigate([`${'/employee/work-history'}`]);
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
