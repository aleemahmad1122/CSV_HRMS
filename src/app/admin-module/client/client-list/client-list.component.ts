import { Component } from '@angular/core';
import { Clients } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { Subject, takeUntil } from 'rxjs';



@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent {
  private ngUnsubscribe = new Subject<void>();
  dataList:Clients[] = [] ;

  constructor(
    private _apiCalling: ApiCallingService
  )
  {

  }



ngOnInit(): void {
  this._apiCalling.getData("Client", "getClients",  true)
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
  this._apiCalling.deleteData("Client", `deleteClient?clientId=${id}`, id,true)
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.dataList = this.dataList.filter((d:Clients) => d.clientId !== id);
        }
      },
      error: (error) => {
        console.error('Error deleting Job:', error);
      }
    });
}


}
