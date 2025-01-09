import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule,  TranslateModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css'
})

export class ImportComponent {
  file: NgxFileDropEntry[] = [];
  preview: string | ArrayBuffer | boolean | null = null;
  fileName: string = '';
  ngUnsubscribe = new Subject<void>();
  data: any[] = []; // To hold the parsed data
  tableHeaders: string[] = []; // Initialize as an empty array

  constructor(
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _toaster: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  public droppedFiles(files: NgxFileDropEntry[]) {
    this.file = files;
    const droppedFile = files[0]; // Get the first file

    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.fileName = file.name; // Store the file name
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target?.result;
          if (typeof fileContent === 'string') {
            this.parseExcelFile(fileContent); // Parse the file content
            this.preview = fileContent; // Set preview to trigger display
            this.preview = true; // Ensure preview is set to true
          }
        };
        reader.readAsBinaryString(file); // Read as binary string for Excel files
      });
    }
  }

  private parseExcelFile(fileContent: string): void {
    const workbook = XLSX.read(fileContent, { type: 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData:any = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convert to JSON

    // Check if jsonData is not empty
    if (jsonData.length > 0) {
      if (jsonData[0]?.length === 0 as any) {
        console.warn('The first row is empty. Please check the file content.');
      } else {
        console.warn(jsonData);
      }

      this.tableHeaders = jsonData[0] as string[]; // Ensure this is treated as a string array
      this.data = jsonData.slice(1); // Remaining rows as data
    } else {
      this.tableHeaders = []; // Initialize as an empty array
      this.data = [];
    }

    // Trigger change detection
    this.cdr.detectChanges();

    console.log('Parsed data:', this.data);
    console.log('Table headers:', this.tableHeaders);
  }

  isPreviewString(): boolean {
    return typeof this.preview === 'string';
  }

  removeFile(): void {
    this.file = [];
    this.preview = null;
    this.fileName = '';
  }

  onSubmit(): void {
    const formData = new FormData();
    try {
      if (this.file.length > 0) {
        const entry = this.file[0]; // Get the first file

        if (entry.fileEntry.isFile) {
          const fileEntry = entry.fileEntry as FileSystemFileEntry;

          fileEntry.file((file: File) => {
            formData.append('file', file, file.name);

            this._apiCalling
              .postData('Attendance', 'bulkImportAttendance', formData, true)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (response) => {
                  if (response?.success) {
                    this._toaster.success(response?.message, 'Success!');
                    // this.back();
                  } else {
                    this._toaster.error(response?.message, 'Error!');
                  }
                },
                error: () => {
                  this._toaster.error(
                    'Internal server error occurred while processing your request',
                    'Error'
                  );
                },
              });
          });
        }
      } else {
        this._toaster.error('No file was dropped', 'Error');
      }
    } catch (error) {
      this._toaster.error('An error occurred while processing the file', 'Error');
    }
  }

  // Download sample file logic
  downloadFile(): void {
    const fileUrl = 'assets/attendance-sample.xlsx';
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = 'attendance-sample.xlsx';
    anchor.click();
  }

  // Back navigation
  back(): void {
    this._router.navigate([window.history.back()]);
  }
}

