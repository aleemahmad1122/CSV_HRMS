import { Component } from '@angular/core';
import { IEmployeeAsset,IEmployeeAssetRes } from '../../../../types/index';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { ExportService } from '../../../../shared/Services/export.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConvertTimePipe } from '../../../../shared/pipes/convert-time.pipe';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,TranslateModule,ConvertTimePipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  dataList: IEmployeeAsset[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
  selectedStatus: number | string = 1;
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;
  id:string = "";



  permissions: { isAssign: boolean; permission: string }[] = [];
  isEdit: boolean = false;
  isCreate: boolean = false;
  isDelete: boolean = false;


  constructor(
    private apiService: ApiCallingService,
    private route: ActivatedRoute,
    private exportService: ExportService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initializeSearch();

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(_ => this.id = _['id']);
    this.getData();

    this.loadPermissions();
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
        this.isEdit = this.permissions.some(p => p.permission === "Edit_Employee_Asset" && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === "Create_Employee_Asset" && p.isAssign);
        this.isDelete = this.permissions.some(p => p.permission === "Delete_Employee_Asset" && p.isAssign);
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
      this.apiService.getData('EmployeeAsset', 'getEmployeeAssets', true, { searchQuery: searchTerm, activeStatus: isActive,employeeId:this.id })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: IEmployeeAssetRes) => this.handleResponse(res),
          error: () => (this.dataList = []),
        });
    }


  private getData(searchTerm = ''): void {
    this.apiService.getData('EmployeeAsset', 'getEmployeeAssets', true, { searchQuery: searchTerm,employeeId:this.id  })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeAssetRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: IEmployeeAssetRes): void {
    if (response?.success) {
      const { assets, pagination } = response.data;
      Object.assign(this, {
        dataList: assets,
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
    const params = { searchQuery: this.searchTerm, pageNo: this.pageNo, pageSize: this.pageSize,employeeId:this.id  };
    this.apiService.getData('EmployeeAsset', 'getEmployeeAssets', true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: (err) => console.error('Error fetching data:', err),
      });
  }

  onDelete(id: string): void {
    this.apiService.deleteData('EmployeeAsset', `deleteEmployeeWorkHistory/${id}`, {},true,this.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) this.dataList = this.dataList.filter((d) => d.employeeAssetId !== id);
        },
        error: (err) => console.error('Error deleting Employee Work Histories:', err),
      });
  }

  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }
}