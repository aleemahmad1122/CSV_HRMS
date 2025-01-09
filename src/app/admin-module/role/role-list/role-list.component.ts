import { Component, OnDestroy } from '@angular/core';
import { IRole, IRoleRes } from '../../../types/index';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ExportService } from '../../../shared/Services/export.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightPipe } from '../../../shared/pipes/highlight.pipe';
import { ToastrService } from 'ngx-toastr';
import { SortingService } from '../../../shared/Services/sorting.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, HighlightPipe],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  dataList: IRole[] = [];
  dropDownList = [10, 50, 75, 100];
  selectedStatus: number | string = 1;
  searchTerm = '';
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

    this.loadPermissions();
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
    this.searchSubject.pipe(
      debounceTime(500),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((term) => this.getData(term));
  }


  private loadPermissions(): void {
    this.activatedRoute.data.subscribe(data => {
      const permissionsData = data['permission'];
      if (Array.isArray(permissionsData)) {
        this.permissions = permissionsData;
        this.isEdit = this.permissions.some(p => p.permission === 'Edit_Role' && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === 'Create_Role' && p.isAssign);
        this.isDelete = this.permissions.some(p => p.permission === 'Delete_Role' && p.isAssign);
      } else {
        console.error("Invalid permissions format:", permissionsData);
      }
    });
  }


  // Handles status change from the dropdown
  onStatusChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedStatus = selectedValue;
    this.getActiveStatusData(this.searchTerm, selectedValue);
  }

  // Fetch data filtered by active status
  private getActiveStatusData(searchTerm = '', isActive: number | string = 0): void {
    this.apiService.getData('Role', 'getRoles', true, { searchQuery: searchTerm, activeStatus: isActive })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IRoleRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  // Fetch data with search term
  private getData(searchTerm = ''): void {
    this.apiService.getData('Role', 'getRoles', true, { searchQuery: searchTerm })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IRoleRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  // Handle response after fetching data
  private handleResponse(response: IRoleRes): void {
    if (response?.success) {
      const { roles, pagination } = response.data;
      Object.assign(this, {
        dataList: roles,
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
        totalCount: pagination.totalCount,
        totalPages: Math.ceil(pagination.totalCount / pagination.pageSize),
      });
    } else {
      this.dataList = [];
    }
  }

  // Search method to trigger search with debounce
  search(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term; // Update the bound search term for highlight pipe
    this.searchSubject.next(term); // Debounce the API call
  }

  // Change page number for pagination
  changePage(newPage: number): void {
    if (newPage > 0 && newPage <= this.totalPages) {
      this.pageNo = newPage;
      this.getPaginatedData();
    }
  }

  // Change page size for pagination
  changePageSize(size: number): void {
    Object.assign(this, { pageSize: size, pageNo: 1 });
    this.getPaginatedData();
  }

  // Fetch paginated data
  private getPaginatedData(): void {
    const params = { searchQuery: this.searchTerm, pageNo: this.pageNo, pageSize: this.pageSize };
    this.apiService.getData('Role', 'getRoles', true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err) => console.error('Error fetching data:', err),
      });
  }

  // Delete a role by its ID
  onDelete(id: string): void {
    this.apiService.deleteData('Role', `deleteRole/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success){ this.dataList = this.dataList.filter((d) => d.roleId !== id)}else{
            this.toaster.error(res?.message + '. ' + res?.data || 'An error occurred', 'Error!');
          };
        },
        error: (err) => console.error('Error deleting Role:', err),
      });
  }

  // Export data in a specified format
  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }

  // Cleanup subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
