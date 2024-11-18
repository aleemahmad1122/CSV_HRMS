import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
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
  selectedValues: any;
  attachedFiles: any[] = [];
  managerList: any[] = [];
  selectedFile: any;
  expenseItems: any[] = [];
  showAddingInput: boolean = true;
  selectedIndex = -1;
  expenseSubDetailId = 0;
  attachmentIndex: number = -1;
  isViewOnly: boolean = false;
  editId:string;
  itemAttachment: any[] = [];
  attachmentTypes: IAttachmentType[] = [];
  id:string = '';
  patchData:any

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _route: ActivatedRoute,private _sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this._route.queryParams.subscribe(params => {
      this.id = params['id']
      this.selectedValues = {};


      if (params['editId'] !== undefined && params['editId'] !== null && params['editId'] !== '' && Number(params['editId']) !== 0) {
        this.isEdit = true;
        this.editId = params['editId']

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
      tableData: this._fb.array([])
    });

    this.addRow();
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this._apiCalling.getData("EmployeeWorkHistory", `getEmployeeWorkHistoryById/${this.editId}`, true, { employeeId: this.id })
        .subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.patchData = response.data;
              this.patchFormValues(this.patchData);
            } else {
              this._toaster.error('Error fetching Work History', 'Error!');
            }
          },
          error: () => {
            this._toaster.error('Error fetching Work History', 'Error!');
          }
        });
    }
    this.getAttachmentTypes();
  }


  private patchFormValues(data: any): void {
    if (data) {
      console.log('API Response:', data);

      // Patch main form values
      const workHistoryData = {
        positionTitle: data.positionTitle || '',
        organization: data.organization || '',
        attachmentTypeId: data.attachmentTypeId || '',
        startDate: this.formatDateToISOString(data.startDate ? new Date(data.startDate) : null),
        endDate: this.formatDateToISOString(data.endDate ? new Date(data.endDate) : null),

      };

      // Now patch the main form with work history data
      this.mainForm.patchValue({
        positionTitle: workHistoryData.positionTitle,
        organization: workHistoryData.organization,
        attachmentTypeId: workHistoryData.attachmentTypeId,
        startDate: workHistoryData.startDate,
        endDate: workHistoryData.endDate,
      });
      console.log('Formatted Dates:', workHistoryData.startDate, workHistoryData.endDate);

      // Now, if you want to set the data for the table rows as well:
      if (this.tableData.length === 0) {
        this.addRow();
      }

      // If you need to populate the table row with the data
      const workHistoryForm = this._fb.group(workHistoryData);
      this.tableData.at(0).patchValue(workHistoryData);

      // Handle attachments if available
      if (data.workHistoryAttachments && data.workHistoryAttachments.length > 0) {
        console.log('Attachments:', data.workHistoryAttachments);

        // Map the attachment data to the format required by the form
        this.attachedFiles = data.workHistoryAttachments.map((attachment: any) => ({
          name: attachment.documentName,
          type: 'pdf',  // Assuming the type is PDF; adjust if necessary
          url: attachment.documentPath,
          base64: '', // Base64 can be handled if needed
        }));

        // Call the saveItemAttachment to update the itemAttachments
        this.saveItemAttachment();
      }
    } else {
      console.error('No data found to patch');
    }
  }



  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('expense');
    }

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


  get tableData(): FormArray {
    return this.mainForm.controls["tableData"] as FormArray;
  }

  convertRowForm(form: any): FormGroup {
    return form as FormGroup;
  }

  addRow() {
    const formData = this._fb.group({
      positionTitle: [this.patchData?.positionTitle || '', [Validators.required]],
      organization: [this.patchData?.organization || '', [Validators.required]],
      attachmentTypeId: [this.patchData?.attachmentTypeId || '', [Validators.required]],
      startDate: [this.patchData?.startDate || '', [Validators.required]],
      endDate: [this.patchData?.endDate || '', [Validators.required]],
    });
    this.tableData.push(formData);
  }



  deleteRow(index: number): void {

    if (index >= 0 && index < this.tableData.length) {
        const updatedControls = this.tableData.controls.filter((_, i) => i !== index);
        this.mainForm.setControl('tableData', this._fb.array(updatedControls));
    } else {
    }

}

private formatDateToISOString(date: Date | null): string | null {
  if (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01 to 12
    const day = date.getDate().toString().padStart(2, '0'); // 01 to 31
    return `${year}-${month}-${day}`;
  }
  return null; // Return null if no date is provided
}


  resetForm(): void {
    this.rowForm.reset();
    this.attachedFiles = [];
    this.selectedIndex = -1;
    this.isEdit = false;
    this.isViewOnly = false;
  }


  trackByFn(index: number, type: any): any {
    return type.attachmentTypeId;
  }

  onSubmit(): void {
    if (this.mainForm.invalid) {
      this.mainForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const formArray = this.mainForm.get('tableData') as FormArray;

    formArray.value.forEach((item: any, itemIndex: number) => {
      // Append work history fields
      formData.append(`workHistoryRequest[${itemIndex}].attachmentTypeId`, item.attachmentTypeId || '');
      formData.append(`workHistoryRequest[${itemIndex}].positionTitle`, item.positionTitle || '');
      formData.append(`workHistoryRequest[${itemIndex}].organization`, item.organization || '');
      formData.append(`workHistoryRequest[${itemIndex}].startDate`, item.startDate || '');
      formData.append(`workHistoryRequest[${itemIndex}].endDate`, item.endDate || '');


      const attachmentItem = this.itemAttachment.find(x => x.index === itemIndex);

if (attachmentItem?.attachments?.length > 0) {
  attachmentItem.attachments.forEach((attachment: any) => {
    if (attachment.url) {
      // Extract the base64 data from the URL
      const base64Data = attachment.url.split(',')[1];

      // Convert base64 string into a binary Blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const file = new Blob(byteArrays, { type: attachment.type });

      // Append the file to FormData
      formData.append(`workHistoryRequest[${itemIndex}].attachment`, file, attachment.name || 'file');
    }
  });
}


    });

    // Make API call
    this._apiCalling
      .postData("EmployeeWorkHistory", "addEmployeeWorkHistory", formData, true, this.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          localStorage.setItem('attachments', JSON.stringify([]));
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $('#saveBatchConfirmationModal').modal('hide');
            this.back();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: () => {
          this._toaster.error("Internal server error occurred while processing your request", 'Error');
        },
      });
  }


  openUploadModal(index: any): void {
    this.attachedFiles = [];
    this.attachmentIndex = index;

    // Retrieve the attachments from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const storedAttachments = localStorage.getItem('attachments');
      if (storedAttachments) {
        const parsedAttachments = JSON.parse(storedAttachments);

        // Find the attachment entry for the given index
        const existingAttachment = parsedAttachments?.find((attachment: any) => attachment.index === index);

        if (existingAttachment) {
          this.attachedFiles = existingAttachment.attachments.map((attachment: any) => {
            const sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(attachment.base64);
            return { ...attachment, url: sanitizedUrl };
          });
        }
      }
    }
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
      // If the file URL is a SafeResourceUrl, convert it to a string
      const fileUrl = file.url
                      ? file.url.changingThisBreaksApplicationSecurity // Extract the actual URL
                      : file.url;

      return {
        name: file.name,
        type: file.type,
        url: fileUrl, // Store the actual URL string
        base64: file.base64 // Store base64 string directly
      };
    });

    // Log to debug before saving
    console.log("Updated Attachments:", updatedAttachments);

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

    // Log itemAttachment to check the structure
    console.log("Item Attachments Before Saving:", this.itemAttachment);

    // Save updated attachments to localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('attachments', JSON.stringify(this.itemAttachment));
    }
  }

  // Hide modal and reset files
  $("#uploadAttachmentModal").modal('hide');
  this.attachedFiles = [];
}


back(): void {
  this._router.navigate([window.history.back()]);
}

}
