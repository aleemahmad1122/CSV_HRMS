import { Component } from '@angular/core';
import { ILeave, ILeaveRes } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ExportService } from '../../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { ConvertTimePipe } from "../../../shared/pipes/convert-time.pipe";

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, HighlightPipe, ConvertTimePipe],
  templateUrl: './leave.component.html',
  styleUrl: './leave.component.css'
})
export class LeaveComponent {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();


  dataList: ILeave[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
  selectedStatus: number | string = 1;
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;
  empId: string = '';

  constructor(
    private apiService: ApiCallingService,
    private route: ActivatedRoute,
    private exportService: ExportService
  ) {
    this.initializeSearch();
    this.initializeEmpId();
    this.getData();
  }

  private initializeEmpId(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.empId = params['id'];
    });
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
    this.apiService.getData('Leave', 'getAllLeaves', true, { searchQuery: searchTerm, activeStatus: isActive, employeeId: this.empId })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ILeaveRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }


  private getData(searchTerm = ''): void {
    this.apiService.getData('Leave', 'getAllLeaves', true, { searchQuery: searchTerm, employeeId: this.empId })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ILeaveRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: ILeaveRes): void {
    if (response?.success) {
      const { leaves, pagination } = response.data;
      Object.assign(this, {
        dataList: leaves,
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
    const params = { searchQuery: this.searchTerm, pageNo: this.pageNo, pageSize: this.pageSize, employeeId: this.empId };
    this.apiService.getData('Leave', 'getAllLeaves', true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err) => console.error('Error fetching data:', err),
      });
  }

  onDelete(id: string): void {
    console.log(id);

    this.apiService.deleteData('Leave', `deleteLeave/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) this.dataList = this.dataList.filter((d) => d.leaveId !== id);
        },
        error: (err) => console.error('Error deleting Leave :', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }


}
