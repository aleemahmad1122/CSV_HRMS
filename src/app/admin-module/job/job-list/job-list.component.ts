import { Component } from '@angular/core';
import { Job, Qualification } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent {
  private ngUnsubscribe = new Subject<void>();
  joblist:Job[] = [] ;

  constructor(
    private _apiCalling: ApiCallingService
  )
  {

  }



ngOnInit(): void {
  this._apiCalling.getData("Job", "getJobs",  true)
  .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
    next: (response) => {
      if (response?.success) {
        this.joblist = response?.data;
      } else {
        this.joblist = [];
      }
    },
    error: (error) => {
      this.joblist = [];
    }
  });
}


onDelete(id:string):void{
  this._apiCalling.deleteData("Job", `deleteJob?jobId=${id}`, id,true)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.joblist = this.joblist.filter((j:Job) => j.jobId !== id);
        }
      },
      error: (error) => {
        console.error('Error deleting Job:', error);
      }
    });
}


}
