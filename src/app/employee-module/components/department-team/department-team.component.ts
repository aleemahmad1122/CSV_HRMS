import { IDepartment, IDepartmentRes, IDesignationRes, IDesignations, IEmployee, IEmployeeDesignation, IEmployeeDesignationRes, IEmployeeRes, ITeam, ITeamRes } from './../../../types/index';
import { ApiCallingService } from './../../../shared/Services/api-calling.service';
import { ExportService } from './../../../shared/Services/export.service';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-department-team',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './department-team.component.html',
  styleUrl: './department-team.component.css'
})
export class DepartmentTeamComponent {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  departmentList: IDepartment[] = []
  teamList: ITeam[] = []
  designationList: IDesignations[] = []
  dataList: IEmployeeDesignation[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
  selectedStatus: number | string = 1;
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;
  id: string = "";

  constructor(
    private apiService: ApiCallingService,
    private route: ActivatedRoute,
    private exportService: ExportService
  ) {
    this.initializeSearch();
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.id = params['id']; // Ensure 'id' is present in the URL
      console.log('Query Parameter ID:', this.id); // Debugging line
    });
    this.getData();
    this.getDepartments();
    this.getDesignations();
    this.getTeams();
  }

  getDepartments(): void {
    this.apiService.getData('Department', 'getDepartments', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IDepartmentRes) => this.departmentList = res.data.departments,
        error: () => ([]),
      });
  }

  getDesignations(): void {
    this.apiService.getData('Designation', 'getDesignations', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IDesignationRes) => this.designationList = res.data.designations,
        error: () => ([]),
      });
  }

  getTeams(): void {
    this.apiService.getData('Team', 'getTeams', true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ITeamRes) => this.teamList = res.data.teams,
        error: () => ([]),
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
    this.apiService.getData('EmployeeDesignation', 'getEmployeeDesignations', true, { searchQuery: searchTerm, activeStatus: isActive })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeDesignationRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }


  private getData(searchTerm = ''): void {
    this.apiService.getData('EmployeeDesignation', 'getEmployeeDesignations', true, { searchQuery: searchTerm, employeeId: this.id })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: IEmployeeDesignationRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: IEmployeeDesignationRes): void {
    if (response?.success) {
      const { employeeDesignations, pagination } = response.data;
      Object.assign(this, {
        dataList: employeeDesignations,
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
