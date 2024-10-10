import { Component } from '@angular/core';
import { Projects } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent  {
  private ngUnsubscribe = new Subject<void>();
  dataList:Projects[] = [] ;

  constructor(
    private _apiCalling: ApiCallingService
  )
  {

  }



ngOnInit(): void {
  this._apiCalling.getData("Project", "getProjects",  true)
  .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
    next: (response) => {
      if (response?.success) {
        this.dataList = response?.data;
      } else {
        this.dataList = [];
      }
    },
    error: (error) => {
      this.dataList = [];
    }
  });
}


onDelete(id:string):void{
  this._apiCalling.deleteData("Project", `deleteProject?projectId=${id}`, id,true)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.dataList = this.dataList.filter((d:Projects) => d.projectId !== id);
        }
      },
      error: (error) => {
        console.error('Error deleting Job:', error);
      }
    });
}


}
