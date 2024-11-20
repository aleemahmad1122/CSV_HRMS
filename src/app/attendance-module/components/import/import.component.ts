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

  file: NgxFileDropEntry[];
  ngUnsubscribe = new Subject<void>();


  constructor(
    private _router: Router,
    private _apiCalling: ApiCallingService,
    private _toaster: ToastrService,
  ){

  }


  public   droppedFiles(file: NgxFileDropEntry[]) {
this.file = file

  }



  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }


  onSubmit(): void {
    const formData = new FormData();

    try {
      if (this.file && this.file.length > 0) {
        const entry = this.file[0]; // Get the first file from the array

        if (entry.fileEntry.isFile) {
          const fileEntry = entry.fileEntry as FileSystemFileEntry;

          // Read the file and append it to FormData
          fileEntry.file((file: File) => {
            formData.append('file', file, file.name);

            // After appending, send the API request
            this._apiCalling
              .postData('Attendance', 'bulkImportAttendance', formData, true)
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



  back(): void {
    this._router.navigate([window.history.back()]);
  }

}
