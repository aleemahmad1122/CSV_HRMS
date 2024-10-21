import { Component } from '@angular/core';
import { Clients } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ExportService } from '../../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent {
  private ngUnsubscribe = new Subject<void>();
  dataList: Clients[] = [];
  dropDownList:number[] = [10,50,75,100]
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(
    private _apiCalling: ApiCallingService,
    private _exportService: ExportService
  ) {
    this.getData();

    this.searchSubject.pipe(
      debounceTime(500),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(searchTerm => {
      this.getData(searchTerm);
    });
  }

  private getData(searchTerm: string = ''): void {
    this._apiCalling.getData("Client", "getClients", true, { searchQuery: searchTerm })
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

  search(search: Event): void {
    const searchTerm = (search.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  onDelete(id: string): void {
    this._apiCalling.deleteData("Client", `deleteClient/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.dataList = this.dataList.filter((d: Clients) => d.clientId !== id);
          }
        },
        error: (error) => {
          console.error('Error deleting Job:', error);
        }
      });
  }

  exportData(format: string): void {
    this._exportService.exportData(format, this.dataList);
  }

}
