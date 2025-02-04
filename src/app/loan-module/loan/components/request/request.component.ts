import { Component, AfterViewInit } from '@angular/core';
import { ILoan, ILoanRes } from '../../../../types/index';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiCallingService } from '../../../../shared/Services/api-calling.service';
import { LocalStorageManagerService } from '../../../../shared/Services/local-storage-manager.service';
import { ExportService } from '../../../../shared/Services/export.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import * as bootstrap from 'bootstrap';
import { ConvertTimePipe } from "../../../../shared/pipes/convert-time.pipe";
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from "../../../../../environments/environment.prod"
import { HighlightPipe } from '../../../../shared/pipes/highlight.pipe';
import { SortingService } from "../../../../shared/Services/sorting.service";
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, DpDatePickerModule, ConvertTimePipe, HighlightPipe,NgSelectModule],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css'
})
export class RequestComponent  implements AfterViewInit {

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };

  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  dataList: ILoan[] = [];
  dropDownList = [10, 50, 75, 100];
  searchTerm = '';
  selectedStatus: number | string = 1;
  totalCount = 0;
  pageSize = 10;
  pageNo = 1;
  totalPages = 0;

  disableDate:boolean;

  submitForm!: FormGroup;


  selectedOption: string = 'All';



  fileOptions: { value: string; name: string }[] = [
    { value: "All", name: "All" },
    { value: "MTD", name: "Month to Date" },
    { value: "YTD", name: "Year to Date" },
    { value: "PreviousYear", name: "Previous Year" },
    { value: "PreviousMonth", name: "Previous Month" },
    { value: "Last7Days", name: "Last 7 Days" }
  ];


  permissions: { isAssign: boolean; permission: string }[] = [];
  isEdit: boolean = false;
  isCreate: boolean = false;
  isDelete: boolean = false;
  isApproval: boolean = false;
  isHr: boolean = false;

  empId: string;
  userId: string;

  selectedEmpId: string;

  msg: string = '';
  isSubmitted = false;

  startDate = '';
  endDate = new Date().toISOString();

  userReporting: {
    employeeId: string;
    fullName: string;
  }[] = []


  pages: (number | string)[] = [];
  visiblePages: number[] = [];



  sortField: string = 'firstName';
  sortDirection: boolean = true;

  constructor(
    private apiService: ApiCallingService,
    private exportService: ExportService,
    private fb: FormBuilder,
    private _localStorage: LocalStorageManagerService,
    private sortingService: SortingService,
    private activatedRoute: ActivatedRoute

  ) {
    this.setFilter('All')
    this.empId = this._localStorage.getEmployeeDetail()[0].employeeId;
    this.userId = this._localStorage.getEmployeeDetail()[0].employeeId;
    this.selectedEmpId = this._localStorage.getEmployeeDetail()[0].employeeId;

    this.getUserReporting()

    this.loadPermissions();



    this.initializeSearch();
    this.getData();

    this.submitForm = this.fb.group({
      leaveStatus: [0],
      comment: ['', Validators.required],
    });
    this.generatePages()
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


  setStatus(status: number): void {
    this.submitForm.patchValue({ leaveStatus: status });
  }


  private loadPermissions(): void {
    this.activatedRoute.data.subscribe(data => {
      const permissionsData = data['permission'];

      if (Array.isArray(permissionsData)) {
        console.log(permissionsData);

        this.permissions = permissionsData;
        this.isEdit = this.permissions.some(p => p.permission === "Edit_Leave" && p.isAssign);
        this.isCreate = this.permissions.some(p => p.permission === "Apply_Leave" && p.isAssign);
        this.isDelete = this.permissions.some(p => p.permission === "Delete_Leave" && p.isAssign);
        this.isApproval = this.permissions.some(p => p.permission === "Leave_Approval" && p.isAssign);
        this.isHr = this.permissions.some(p => p.permission === "HR_Approval" && p.isAssign);
      } else {
        console.error("Invalid permissions format:", permissionsData);
      }
    });
  }


  ngAfterViewInit(): void {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  getloanStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved';
      case 2:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }
  search(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term; // Update the bound search term for highlight pipe
    this.searchSubject.next(term); // Debounce the API call
  }

  onUserSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedEmpId = selectElement.value;
  }

  getUserReporting(): void {
    this.apiService
      .getData('Attendance', 'getUserReportings', true, {
        employeeId: this.empId
      })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.userReporting = response.data;
          } else {
            this.userReporting = []; // Handle case when response is not successful
          }
        },
        error: () => {
          this.userReporting = []; // Handle error scenario
        },
      });
  }



  onDelete(id: string): void {

    this.apiService.deleteData("Loan", `deleteLeave/${id}`, id, true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res?.success) this.dataList = this.dataList.filter((d) => d.loanId !== id);
        },
        error: (err) => console.error('Error deleting Company:', err),
      });
  }



  setFilter(option: string): void {
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const formatDate = (date: Date): string => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    switch (option) {

      case 'MTD':
        this.startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        this.endDate = formatDate(endOfDay);
          this.disableDate = false
        break;

        case 'YTD':
          this.startDate = formatDate(new Date(today.getFullYear(), 0, 1));
          this.endDate = formatDate(endOfDay);
            this.disableDate = false
          break;


      case 'QTD': {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        this.startDate = formatDate(new Date(today.getFullYear(), quarterStartMonth, 1));
        this.endDate = formatDate(endOfDay);
          this.disableDate = false
        break;
      }

      case 'PreviousYear': {
        const lastYear = today.getFullYear() - 1;
        this.startDate = formatDate(new Date(lastYear, 0, 1));
        this.endDate = formatDate(new Date(lastYear, 11, 31, 23, 59, 59, 999));
          this.disableDate = false
        break;
      }

      case 'PreviousMonth': {
        const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        this.startDate = formatDate(previousMonthStart);
        this.endDate = formatDate(previousMonthEnd);
          this.disableDate = false
        break;
      }

      case 'Last7Days': {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 6);
        lastWeek.setHours(0, 0, 0, 0);
        this.startDate = formatDate(lastWeek);
        this.endDate = formatDate(endOfDay);
          this.disableDate = false
        break;
      }

      case 'All': {
        this.startDate = '';
        this.endDate = '';
        this.disableDate = true
        break;
      }

      default:
        this.startDate = '';
        this.endDate = '';
        this.disableDate = true
        return;
    }

    // this.applyDateFilter();
  }

  onStartDateChange(event: Event): void {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.startDate = selectedDate; // Update local state
  }

  onEndDateChange(event: Event): void {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.endDate = selectedDate; // Update local state
  }

  applyDateFilter(): void {
    if (this.startDate && this.endDate) {
      this.msg = ''
      const params = {
        searchQuery: this.searchTerm,
        employeeId: this.selectedEmpId,
        startDate: this.startDate,
        endDate: this.endDate,
      };
      this.apiService
        .getData("Loan", "getLoanRequests", true, params)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: ILoanRes) => this.handleResponse(res),
          error: () => (this.dataList = []),
        });
    } else {
      this.msg = "Both start Date and end Date must be selected before applying the filter."
    }
  }
  private initializeSearch(): void {
    this.searchSubject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((term) => this.getData(term));
  }


  private getData(searchTerm = ''): void {
    const params = {
      searchQuery: searchTerm,
      employeeId: this.selectedEmpId,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.apiService
      .getData("Loan", "getLoanRequests", true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: ILoanRes) => this.handleResponse(res),
        error: () => (this.dataList = []),
      });
  }

  private handleResponse(response: ILoanRes): void {
    if (response?.success) {
      const { loans, pagination } = response.data;
      Object.assign(this, {
        dataList: loans,
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
        totalCount: pagination.totalCount,
        totalPages: Math.ceil(pagination.totalCount / pagination.pageSize),
      });
    } else {
      this.dataList = [];
    }
  }

  onSubmit(id: string) {
    this.isSubmitted = true;
    if (!this.submitForm.valid) {
      return;
    }

    this.apiService
      .patchData("Loan", `processLoan/${id}`, this.submitForm.value, true,this.empId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.getData()
            this.submitForm.reset()
          }
        },
        error: () => {
          this.submitForm.reset()
          this.userReporting = []; // Handle error scenario
        },
      });

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
    const params = {
      searchQuery: this.searchTerm,
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      employeeId: this.selectedEmpId,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.apiService
      .getData("Loan", "getLoanRequests", true, params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) =>{ this.handleResponse(res);    this.generatePages();},
        error: (err) => console.error('Error fetching data:', err),
      });
  }


  exportData(format: string): void {
    this.exportService.exportData(format, this.dataList);
  }
}

