import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { Qualification } from '../../../types';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-qualifications-list',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule, TranslateModule],
  templateUrl: './qualifications-list.component.html',
  styleUrl: './qualifications-list.component.css'
})
export class QualificationsListComponent implements OnInit {
  private ngUnsubscribe = new Subject<void>();
  qualifications: Qualification[] = [];
  constructor(
    private _apiCalling: ApiCallingService,
  ) { }



  ngOnInit(): void {
    this._apiCalling.getData("Qualification", "getQualifications",  true)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.qualifications = response?.data;
        } else {
          this.qualifications = [];
        }
      },
      error: (error) => {
        this.qualifications = [];
      }
    });
  }


onDelete(id: string): void {
  this._apiCalling.deleteData("Qualification", `deleteQualification?qualificationId=${id}`, id,true)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.qualifications = this.qualifications.filter((q:Qualification) => q.qualificationId !== id);
        }
      },
      error: (error) => {
        console.error('Error deleting qualification:', error);
      }
    });
}

}
