import { Component } from '@angular/core';
import { EmployeeDetail, IEmployee, IEmployeeRes } from '../../types/index';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ExportService } from '../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { ToastrService } from 'ngx-toastr';
import { SortingService } from "../../shared/Services/sorting.service";
import { ConvertTimePipe } from '../../shared/pipes/convert-time.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, HighlightPipe,ConvertTimePipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  defaultImagePath = 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';


  dataList: IEmployee[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
  selectedStatus: number | string = 1;
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;

  sortField: string = 'firstName';
  sortDirection: boolean = true;


  permissions: { isAssign: boolean; permission: string }[] = [];
  isEdit: boolean = false;
  isHr: boolean = false;
  isCreate: boolean = false;
  isDelete: boolean = false;
  emp: EmployeeDetail;


  pages: (number | string)[] = [];
  visiblePages: number[] = [];

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
    this.generatePages();
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
        this.isEdit = this.permissions.some(p => p.permission === "Edit_Employee" && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === "Create_Employee" && p.isAssign);
        this.isDelete = this.permissions.some(p => p.permission === "Delete_Employee" && p.isAssign);
        this.isHr = this.permissions.some(p => p.permission === "HR_Approval" && p.isAssign);
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
    this.apiService.getData('Employee', 'getEmployees', true, { searchQuery: searchTerm, activeStatus: isActive })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeRes) => { this.handleResponse(res); this.generatePages() },
        error: () => (this.dataList = []),
      });
  }


  private getData(searchTerm = ''): void {
    this.apiService.getData('Employee', 'getEmployees', true, { searchQuery: searchTerm })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeRes) => { this.handleResponse(res); this.generatePages() },
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: IEmployeeRes): void {
    if (response?.success) {
      const { employeeDetails, pagination } = response.data;
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



  generatePages() {
    const maxVisiblePages = 3; // Maximum number of visible pages
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, this.pageNo - half);
    let end = Math.min(this.totalPages, this.pageNo + half);

    // Make sure at least one page is visible
    if (this.pageNo === 1) {
      start = 1;
      end = Math.min(this.totalPages, maxVisiblePages); // Show first few pages
    } else if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      } else if (end === this.totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }


    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
    // If no pages are visible, ensure at least the first page is shown
    if (this.visiblePages.length === 0) {
      this.visiblePages.push(1);
    }


  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNo = newPage;
      this.getPaginatedData()
      this.generatePages();
    }
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getPaginatedData()
    this.generatePages();
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

    this.apiService.deleteData('Employee', `deleteEmployee/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) { this.getActiveStatusData('', this.selectedStatus) } else {
            this.toaster.error(res?.message + '. ' + res?.data || 'An error occurred', 'Error!');
          };
        },
        error: (err) => console.error('Error deleting Employee:', err),
      });
  }

  onBlackList(id: string): void {
    this.apiService.deleteData('Employee', `blacklistEmployee/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) { this.getActiveStatusData('', this.selectedStatus) } else {
            this.toaster.error(res?.message + '. ' + res?.data || 'An error occurred', 'Error!');
          };
        },
        error: (err) => console.error('Error blacklist Employee:', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }



  setPass(emp: any): void {

    this.apiService.postData("auth", "setPasswordEmail",
      {
        "role": emp?.role || "N/A",
        "email": emp?.email || "N/A",
        "link": document.getElementsByTagName('base')[0].href || "N/A",
        "employeeName": emp?.firstName || "N/A"
      }, true, emp.employeeId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toaster.success(response?.message, 'Success!');
          } else {
            this.toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this.toaster.error("Internal server error occured while processing your request")
        }
      })
  }


}
