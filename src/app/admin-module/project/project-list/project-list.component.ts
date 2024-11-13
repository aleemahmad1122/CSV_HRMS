import { Component } from '@angular/core';
import { Projects,IProjectRes } from '../../../types/index';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ExportService } from '../../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,TranslateModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  dataList: Projects[] = [];
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
      this.apiService.getData('Project', 'getProjects', true, { searchQuery: searchTerm, activeStatus: isActive })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: IProjectRes) => this.handleResponse(res),
          error: () => (this.dataList = []),
        });
    }


  private getData(searchTerm = ''): void {
    this.apiService.getData('Project', 'getProjects', true, { searchQuery: searchTerm })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IProjectRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: IProjectRes): void {
    if (response?.success) {
      const { projects, pagination } = response.data;
      Object.assign(this, {
        dataList: projects,
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
    this.apiService.getData('Project', 'getProjects', true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err) => console.error('Error fetching data:', err),
      });
  }

  onDelete(id: string): void {
    this.apiService.deleteData('Project', `deleteProject/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) this.dataList = this.dataList.filter((d) => d.projectId !== id);
        },
        error: (err) => console.error('Error deleting Project:', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }
}
