import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ApiCallingService } from "../../shared/Services/api-calling.service";
import { ToastrService } from 'ngx-toastr';
import { LocalStorageManagerService } from '../../shared/Services/local-storage-manager.service';
import { AttendanceSummary, EmployeeDetail, EmployeeLeaveSummary, ResDasSummary, TeamSummary } from "../../types/index";
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../environments/environment.prod';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, DpDatePickerModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };

  emp:EmployeeDetail;

  attendanceSummary: AttendanceSummary = {} as AttendanceSummary; // Avoid null value
  employeeLeaveSummary: EmployeeLeaveSummary[] = [];
  teamSummary: TeamSummary[] = [];
  empId: string;
  summaryItems: { title: string; count: any; icon: string; color: string; percentage: string | number; }[] = [];
  startDate = '';
  endDate = new Date().toISOString();
  totalAttendance: number = 0;
  checkInTime:string = '';

  constructor(
    private api: ApiCallingService,
    private _localStorage: LocalStorageManagerService,
    private _toaster: ToastrService,
  ) {
    this.empId = this._localStorage.getEmployeeDetail()[0].employeeId;
    this.emp = this._localStorage.getEmployeeDetail()[0];
    // Set default dates for Month to Date (MTD)
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.fetchAttendanceData({
      startDate: this.startDate,
      endDate: this.endDate,
    });
  }

  ngOnChanges(): void {
    if (this.attendanceSummary) {
      this.updateSummaryItems();
    }
  }

  private updateSummaryItems(): void {
    // Ensure attendance data is available before calculating percentages
    const total = this.totalAttendance || 1; // Avoid division by zero

    this.summaryItems = [
      {
        title: 'language.generic.absents',
        count: this.attendanceSummary.absents || 0,
        icon: 'fa-user-times',
        color: 'danger',
        percentage: ((this.attendanceSummary.absents / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.presents',
        count: this.attendanceSummary.presents || 0,
        icon: 'fa-user-check',
        color: 'success',
        percentage: ((this.attendanceSummary.presents / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.leaves',
        count: this.attendanceSummary.leaves || 0,
        icon: 'fa-calendar-day',
        color: 'info',
        percentage: ((this.attendanceSummary.leaves / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.late',
        count: this.attendanceSummary.late || 0,
        icon: 'fa-clock',
        color: 'warning',
        percentage: ((this.attendanceSummary.late / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.early',
        count: this.attendanceSummary.early || 0,
        icon: 'fa-hourglass-half',
        color: 'primary',
        percentage: ((this.attendanceSummary.early / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.halfDays',
        count: this.attendanceSummary.halfDays || 0,
        icon: 'fa-adjust',
        color: 'secondary',
        percentage: ((this.attendanceSummary.halfDays / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.offDays',
        count: this.attendanceSummary.offDays || 0,
        icon: 'fa-umbrella-beach',
        color: 'dark',
        percentage: ((this.attendanceSummary.offDays / total) * 100).toFixed(2),
      },
      {
        title: 'language.generic.missingAttendance',
        count: this.attendanceSummary.missingAttendance || 0,
        icon: 'fa-question-circle',
        color: 'muted',
        percentage: ((this.attendanceSummary.missingAttendance / total) * 100).toFixed(2),
      },
    ];

  }

  private fetchAttendanceData({ startDate, endDate }: { startDate: string; endDate: string }): void {
    this.api.getData("Dashboard", `getDashboardSummary`, true, { employeeId: this.empId, startDate, endDate }).subscribe({
      next: (response: ResDasSummary) => {
        if (response.success) {
          this.attendanceSummary = response.data.attendanceSummary || {} as AttendanceSummary;
          this.employeeLeaveSummary = response.data.employeeLeaveSummary || [];
          this.teamSummary = response.data.teamSummary || [];

          // Calculate total attendance
          this.totalAttendance = (
            this.attendanceSummary.absents +
            this.attendanceSummary.presents +
            this.attendanceSummary.leaves +
            this.attendanceSummary.late +
            this.attendanceSummary.early +
            this.attendanceSummary.halfDays +
            this.attendanceSummary.offDays +
            this.attendanceSummary.missingAttendance
          );
          this.updateSummaryItems();
        } else {
          this.teamSummary = [];
          this._toaster.error(response?.message || 'An error occurred');
        }
      },
      error: (error) => {
        this._toaster.error(error, "An error occurred while processing your request. Please try again later.");
        this.teamSummary = [];
      }
    });
  }


  setFilter(option: string): void {
    const today = new Date();
    switch (option) {
      case 'YTD': // Year to Date
        this.startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'MTD': // Month to Date
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'QTD': // Quarter to Date
        const currentQuarter = Math.floor(today.getMonth() / 3);
        this.startDate = new Date(today.getFullYear(), currentQuarter * 3, 1).toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'PreviousYear':
        const lastYear = today.getFullYear() - 1;
        this.startDate = new Date(lastYear, 0, 1).toISOString().split('T')[0];
        this.endDate = new Date(lastYear, 11, 31).toISOString().split('T')[0];
        break;
      case 'PreviousMonth':
        const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        this.startDate = firstDayPrevMonth.toISOString().split('T')[0];
        this.endDate = lastDayPrevMonth.toISOString().split('T')[0];
        break;
      case 'Last7Days':
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 6); // Go back 6 days from today
        this.startDate = lastWeek.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      default:
        break;
    }
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
      const params = {
        employeeId: this.empId,
        startDate: this.startDate,
        endDate: this.endDate,
      };

      this.api
        .getData('Dashboard', 'getDashboardSummary', true, params)
        .subscribe({
          next: (response: ResDasSummary) => {
            if (response.success) {
              this.attendanceSummary = response.data.attendanceSummary || {} as AttendanceSummary;
              this.employeeLeaveSummary = response.data.employeeLeaveSummary || [];
              this.teamSummary = response.data.teamSummary || [];

              // Update total attendance and summary items
              this.totalAttendance = (
                this.attendanceSummary.absents +
                this.attendanceSummary.presents +
                this.attendanceSummary.leaves +
                this.attendanceSummary.late +
                this.attendanceSummary.early +
                this.attendanceSummary.halfDays +
                this.attendanceSummary.offDays +
                this.attendanceSummary.missingAttendance
              );
              this.updateSummaryItems();
            } else {
              this._toaster.error(response?.message || 'An error occurred');
              this.teamSummary = [];
            }
          },
          error: (error) => {
            this._toaster.error(
              'An error occurred while processing your request. Please try again later.',
              'Error'
            );
            this.teamSummary = [];
          },
        });
    } else {
      this._toaster.warning('Please select both start and end dates.', 'Invalid Dates');
    }
  }


}
