import { Component } from '@angular/core';
import { Projects, IProjectRes } from '../../../types/index';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ExportService } from '../../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { ConvertTimePipe } from "../../../shared/pipes/convert-time.pipe";
import { ToastrService } from 'ngx-toastr';
import { SortingService } from '../../../shared/Services/sorting.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, HighlightPipe, ConvertTimePipe],
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

  permissions: { isAssign: boolean; permission: string }[] = [];
    isEdit: boolean = false;
  isCreate: boolean = false;
  isDelete: boolean = false;



  sortField: string = 'name';
  sortDirection: boolean = true;

  constructor(
    private apiService: ApiCallingService,
    private exportService: ExportService,
    private toaster: ToastrService,
    private sortingService: SortingService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initializeSearch();
    this.getData();
    this.loadPermissions()
  }


  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = !this.sortDirection; // Toggle sort direction
    } else {
      this.sortField = field; // Set new sort field
      this.sortDirection = true; // Reset to ascending
    }
    this.dataList = this.sortingService.sort(this.dataList as any, this.sortField as keyof typeof this.dataList[0], this.sortDirection) as any;
  }


  private initializeSearch(): void {
    this.searchSubject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((term) => this.getData(term));
  }

  private loadPermissions(): void {
    this.activatedRoute.data.subscribe(data => {

      const permissionsData = data['permission'];
      if (Array.isArray(permissionsData)) {
        this.permissions = permissionsData;
        this.isEdit = this.permissions.some(p => p.permission === "Edit_Project" && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === "Create_Project" && p.isAssign);
        this.isDelete = this.permissions.some(p => p.permission === "Delete_Project" && p.isAssign);
      } else {
        console.error("Invalid permissions format:", permissionsData);
      }
    });
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
          if (res?.success){ this.dataList = this.dataList.filter((d) => d.projectId !== id)}else{
            this.toaster.error(res?.message + '. ' + res?.data || 'An error occurred', 'Error!');
          };
        },
        error: (err) => console.error('Error deleting Project:', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }
}
