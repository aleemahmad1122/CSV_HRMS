import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
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
  submissionForm!: FormGroup;
  mainForm!: FormGroup;
  isEdit: boolean = false;
  isEditPermanently: boolean = false;
  selectedValues: any;
  attachedFiles: any[] = [];
  managerList: any[] = [];
  selectedFile: any;
  expenseItems: any[] = [];
  showAddingInput: boolean = true;
  selectedIndex = -1;
  expenseSubDetailId = 0;
  isViewOnly: boolean = false;
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
      this.selectedValues = {};
      if (params['id'] !== undefined && params['id'] !== null && params['id'] !== '' && Number(params['id']) !== 0) {
        this.isEdit = true;
        this.isEditPermanently = true;

        if (isPlatformBrowser(this.platformId)) {
          this.selectedValues = JSON.parse(localStorage.getItem('expense')!);
        }

        this.showAddingInput = false;
        this.expenseItems = this.selectedValues?.expenseSubInformation == undefined ? this.selectedValues : this.selectedValues?.expenseSubInformation;
      }

      if (params['isView'] !== undefined && params['isView'] !== null && params['isView'] !== '' && Number(params['isView']) !== 0) {
        this.isViewOnly = true;
      }
    });

    this.mainForm = this._fb.group({
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
    return this.mainForm.controls["expenseAllItem"] as FormArray;
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


  droppedFiles(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const blob = new Blob([e.target.result], { type: file.type });
            const url = URL.createObjectURL(blob);
            this.attachedFiles.push({
              file: file,
              name: file.name,
              type: file.type,
              url: this._sanitizer.bypassSecurityTrustResourceUrl(url)
            });
            this.getSelectedFile(this.attachedFiles.length - 1);
          };
          reader.readAsArrayBuffer(file);
        });
      }
    }
  }


  getSelectedFile(index: number) {
    this.selectedFile = this.attachedFiles[index];
    console.log('Selected file:', this.selectedFile, {
      name: this.selectedFile?.name,
      type: this.selectedFile?.type,
      url: this.selectedFile?.url
    });
  }

  addFileToAttachment(newFile: File) {
    this.attachedFiles.push(newFile);
    console.log('File added to attachments:', newFile);
    // Optionally, you can also call getSelectedFile if you want to select the newly added file
    this.getSelectedFile(this.attachedFiles.length - 1);
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
    // if (!this.submissionForm.valid) {
    //   return;
    // }
    var formData = new FormData();
    var formArray = this.mainForm.get('expenseAllItem') as FormArray;

    formArray.value.forEach((item: any, itemIndex: number) => {
      // Add null checks for dates
      const startDate = item.startDate ? `${item.startDate.year}-${item.startDate.month}-${item.startDate.day}` : '';
      const endDate = item.endDate ? `${item.endDate.year}-${item.endDate.month}-${item.endDate.day}` : '';

      formData.append(`workHistoryRequest[${itemIndex}].attachmentTypeId`, item.attachmentTypeId || '');
      formData.append(`workHistoryRequest[${itemIndex}].positionTitle`, item.positionTitle || '');
      formData.append(`workHistoryRequest[${itemIndex}].organization`, item.organization || '');
      formData.append(`workHistoryRequest[${itemIndex}].startDate`, startDate);
      formData.append(`workHistoryRequest[${itemIndex}].endDate`, endDate);

      // Find attachments for this index
      const attachmentItem = this.itemAttachment.find(x => x.index === itemIndex);
      if (attachmentItem?.attachments?.length > 0) {
        attachmentItem.attachments.forEach((attachment: any) => {
          formData.append(`workHistoryRequest[${itemIndex}].attachments`, attachment.file);
        });
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

  isImageFile(file: any): boolean {
    if (!file) return false;
    const fileName = file.name || file.fileName || '';
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  isPdfFile(file: any): boolean {
    return file?.type === 'application/pdf' ||
           (file?.name && file.name.toLowerCase().endsWith('.pdf'));
  }

  saveItemAttachment(): void {
    if (this.attachedFiles.length > 0) {
      // Remove existing attachments for this index if they exist
      const existingIndex = this.itemAttachment.findIndex(x => x.index === this.attachmentIndex);
      if (existingIndex !== -1) {
        this.itemAttachment.splice(existingIndex, 1);
      }

      // Add new attachments
      this.itemAttachment.push({
        index: this.attachmentIndex,
        attachments: [...this.attachedFiles] // Create a copy of attachments array
      });
    }
    $("#uploadAttachmentModal").modal('hide');
    this.attachedFiles = [];
  }





}
