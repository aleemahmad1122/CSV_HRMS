import { Component } from '@angular/core';
import { IEmployee,IEmployeeRes } from '../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ExportService } from '../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,TranslateModule,HighlightPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent   {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();


  dataList: IEmployee[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
  selectedStatus: number | string = 1;
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;

  constructor(
    private apiService: ApiCallingService,
    private exportService: ExportService
  ) {
    this.initializeSearch();
    this.getData();
  }

  private initializeSearch(): void {
    this.searchSubject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((term) => this.getData(term));
  }


 // Handles status change from the dropdown
 onStatusChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;
  this.selectedStatus = selectedValue;
  this.getActiveStatusData('', selectedValue);
}

// Fetch data filtered by active status
private getActiveStatusData(searchTerm = '', isActive: number | string = 0): void {

  // Call the API with the active status filter
  this.apiService.getData('Employee', 'getEmployees', true, { searchQuery: searchTerm, activeStatus: isActive })
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res: IEmployeeRes) => this.handleResponse(res),
      error: () => (this.dataList = []),
    });
}


  private getData(searchTerm = ''): void {
    this.apiService.getData('Employee', 'getEmployees', true, { searchQuery: searchTerm })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: IEmployeeRes): void {
    if (response?.success) {
      const {employeeDetails, pagination } = response.data;
      Object.assign(this, {
        dataList: employeeDetails,
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
        totalCount: pagination.totalCount,
        totalPages: Math.ceil(pagination.totalCount / pagination.pageSize),
      });
    } else this.dataList = [];
  }

  search(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term; // Update the bound search term for highlight pipe
    this.searchSubject.next(term); // Debounce the API call
  }

  changePage(newPage: number): void {
    if (newPage > 0 && newPage <= this.totalPages) {
      this.pageNo = newPage;
      this.getPaginatedData();
    }
  }

  changePageSize(size: number): void {
    Object.assign(this, { pageSize: size, pageNo: 1 });
    this.getPaginatedData();
  }

  private getPaginatedData(): void {
    const params = { searchQuery: this.searchTerm, pageNo: this.pageNo, pageSize: this.pageSize };
    this.apiService.getData('Employee', 'getEmployees', true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err) => console.error('Error fetching data:', err),
      });
  }

  onDelete(id: string): void {
    console.log(id);

    this.apiService.deleteData('Employee', `deleteEmployee/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) this.dataList = this.dataList.filter((d) => d.employeeId !== id);
        },
        error: (err) => console.error('Error deleting Employee:', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }


}
