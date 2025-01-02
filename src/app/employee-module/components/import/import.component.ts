import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [NgxFileDropModule, CommonModule, FormsModule, ReactiveFormsModule,  TranslateModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css'
})
export class ImportComponent {
  file: NgxFileDropEntry[] = [];
  preview: string | ArrayBuffer | null = null;
  fileName: string = '';
  ngUnsubscribe = new Subject<void>();

  constructor(
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _toaster: ToastrService,
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  public droppedFiles(files: NgxFileDropEntry[]) {
    this.file = files;
    const droppedFile = files[0]; // Get the first file

    // Check if the dropped file is an actual file
    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.fileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.preview = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }
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
        const entry = this.file[0];

        if (entry.fileEntry.isFile) {
          const fileEntry = entry.fileEntry as FileSystemFileEntry;

          fileEntry.file((file: File) => {
            formData.append('file', file, file.name);

            this._apiCalling
              .postData('Employee', 'importEmployees', formData, true)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (response) => {
                  if (response?.success) {
                    this._toaster.success(response?.message, 'Success!');
                    this.back();
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

  downloadFile(): void {
    const fileUrl = 'assets/employee-sample.xlsx';
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = 'employee-sample.xlsx';
    anchor.click();
  }

  back(): void {
    this._router.navigate([window.history.back()]);
  }
}


