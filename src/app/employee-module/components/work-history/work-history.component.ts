import { Component } from '@angular/core';
import { IEmployeeWorkHistoryRes,IEmployeeWorkHistory, IRoleRes } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ExportService } from '../../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-work-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,TranslateModule],
  templateUrl: './work-history.component.html',
  styleUrl: './work-history.component.css'
})
export class WorkHistoryComponent {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  dataList: IEmployeeWorkHistory[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
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

  private getData(searchTerm = ''): void {
    this.apiService.getData('EmployeeWorkHistory', 'getEmployeeWorkHistories', true, { searchQuery: searchTerm })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeWorkHistoryRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: IEmployeeWorkHistoryRes): void {
    if (response?.success) {
      const { employeeWorkHistoryDetails, pagination } = response.data;
      Object.assign(this, {
        dataList: employeeWorkHistoryDetails,
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
        totalCount: pagination.totalCount,
        totalPages: Math.ceil(pagination.totalCount / pagination.pageSize),
      });
    } else this.dataList = [];
  }

  search(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
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
    this.apiService.getData('EmployeeWorkHistory', 'getEmployeeWorkHistories', true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err) => console.error('Error fetching data:', err),
      });
  }

  onDelete(id: string): void {
    console.log(id);

    this.apiService.deleteData('EmployeeWorkHistory', `deleteEmployeeWorkHistory/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) this.dataList = this.dataList.filter((d) => d.roleId !== id);
        },
        error: (err) => console.error('Error deleting Employee Work History:', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }
}
