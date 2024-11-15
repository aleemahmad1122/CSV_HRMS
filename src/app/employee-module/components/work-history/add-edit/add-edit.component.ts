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
import { TranslateModule } from '@ngx-translate/core';
import { IAttachmentTypeRes, IAttachmentType } from "../../../../types/index";
declare const $: any;



@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule,  TranslateModule],
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
  id:string = '';

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
      this.id = params['id']
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


  formatStartDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mainForm.patchValue({
      startDate: new Date(input.value).toISOString()
    });
  }

  formatEndDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mainForm.patchValue({
      endDate: new Date(input.value).toISOString()
    });
  }

  addRow() {
    const expenseItemForm = this._fb.group(
      {
        positionTitle: ['', [Validators.required]],
        organization: ['', [Validators.required]],
        attachmentTypeId: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('expense');
    }

  }


  trackByFn(index: number, type: any): any {
    return type.attachmentTypeId;
  }

  onSubmit(): void {

      if (this.mainForm.invalid) {
        this.mainForm.markAllAsTouched();
    this._toaster.error('Please fill the form before submitting', 'Validation Error');
    return;
  }


    var formData = new FormData();
    var formArray = this.mainForm.get('expenseAllItem') as FormArray;

    formArray.value.forEach((item: any, itemIndex: number) => {


      formData.append(`workHistoryRequest[${itemIndex}].attachmentTypeId`, item.attachmentTypeId || '');
      formData.append(`workHistoryRequest[${itemIndex}].positionTitle`, item.positionTitle || '');
      formData.append(`workHistoryRequest[${itemIndex}].organization`, item.organization || '');
      formData.append(`workHistoryRequest[${itemIndex}].startDate`, item.startDate);
      formData.append(`workHistoryRequest[${itemIndex}].endDate`, item.endDate );

      // Find attachments for this index
      const attachmentItem = this.itemAttachment.find(x => x.index === itemIndex);
      if (attachmentItem?.attachments?.length > 0) {
        attachmentItem.attachments.forEach((attachment: any) => {
          formData.append(`workHistoryRequest[${itemIndex}].attachment`, attachment.file);
        });
      }



    });


    this._apiCalling.postData("EmployeeWorkHistory", "addEmployeeWorkHistory", formData, true,this.id)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          localStorage.setItem('attachments', null);
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
    this._router.navigate([`${'/employee/employee-list'}`]);
  }

  attachmentIndex: number = -1;





  openUploadModal(index: any): void {
    this.attachedFiles = []; // Reset the attached files array
    this.attachmentIndex = index;

    // Retrieve the attachments from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const storedAttachments = localStorage.getItem('attachments');

      if (storedAttachments) {
        // Parse the stored attachments from localStorage
        const parsedAttachments = JSON.parse(storedAttachments);

        // Find the attachment entry for the given index
        const existingAttachment = parsedAttachments.find((attachment: any) => attachment.index === index);

        if (existingAttachment) {
          // Map over the attachments and load their URLs for preview
          this.attachedFiles = existingAttachment.attachments.map((attachment: any) => {
            // Recreate the URL using the stored base64
            const sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(attachment.base64);
            return {
              ...attachment,
              url: sanitizedUrl, // Trust the resource URL for preview
            };
          });
        }
      }
    }

    // Show the modal
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

  droppedFiles(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const base64 = e.target.result as string;
            const sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(base64);

            // Push file details into the attachedFiles array
            const fileDetails = {
              file: file,
              name: file.name,
              type: file.type,
              url: sanitizedUrl,
              base64: base64 // Store the base64 string
            };
            this.attachedFiles.push(fileDetails);

            // Optionally call getSelectedFile if needed
            this.getSelectedFile(this.attachedFiles.length - 1);
          };
          reader.readAsDataURL(file); // Use Data URL to get base64 string
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
  // Remove the file from the attachedFiles array
  this.attachedFiles.splice(index, 1);

  // Update the attachments in itemAttachment for the current index
  const existingIndex = this.itemAttachment.findIndex(x => x.index === this.attachmentIndex);
  if (existingIndex !== -1) {
    // Update the attachments for this index
    this.itemAttachment[existingIndex].attachments = [...this.attachedFiles];
  }

  // Save the updated attachments to localStorage
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('attachments', JSON.stringify(this.itemAttachment));
  }

}

saveItemAttachment(): void {
  if (this.attachedFiles.length > 0) {
    // Convert files to base64 or data URL for persistence
    const updatedAttachments = this.attachedFiles.map(file => {
      const fileDetails = {
        name: file.name,
        type: file.type,
        url: file.url, // already a safe URL created by _sanitizer
        base64: file.url.changingThisBreaksApplicationSecurity // Store the URL string
      };
      return fileDetails;
    });

    // Check if an attachment already exists for the given index
    const existingIndex = this.itemAttachment.findIndex(x => x.index === this.attachmentIndex);
    if (existingIndex !== -1) {
      // If it exists, update the existing attachment entry
      this.itemAttachment[existingIndex].attachments = updatedAttachments;
    } else {
      // If it doesn't exist, add a new attachment entry
      this.itemAttachment.push({
        index: this.attachmentIndex,
        attachments: updatedAttachments
      });
    }

    // Save updated attachments to localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('attachments', JSON.stringify(this.itemAttachment));
    }
  }

  // Hide modal and reset files
  $("#uploadAttachmentModal").modal('hide');
  this.attachedFiles = [];
}





}
