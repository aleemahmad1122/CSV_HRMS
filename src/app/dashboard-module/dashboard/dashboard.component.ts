import { AfterViewInit, Component, OnInit, NgZone } from '@angular/core';
import * as Highcharts from 'highcharts';
import { TranslateModule } from '@ngx-translate/core';
import { ApiCallingService } from "../../shared/Services/api-calling.service";
import { ToastrService } from 'ngx-toastr';
import { LocalStorageManagerService } from '../../shared/Services/local-storage-manager.service';
import { AttendanceSummary, EmployeeDetail, EmployeeLeaveSummary, ICheckInSummary, ResDasSummary, TeamSummary } from "../../types/index";
import { DpDatePickerModule } from 'ng2-date-picker';
import { environment } from '../../../environments/environment.prod';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighchartsChartModule } from 'highcharts-angular';
import { ConvertTimePipe } from '../../shared/pipes/convert-time.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, DpDatePickerModule, ReactiveFormsModule, NgSelectModule, RouterModule,HighchartsChartModule,ConvertTimePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  datePickerConfig = {
    format: environment.dateTimePatterns.date,
  };

  emp: EmployeeDetail;

  attendanceSummary: AttendanceSummary = {} as AttendanceSummary; // Avoid null value

  absentData: { date: string; }[] = [];
  lateData: { attendanceDate: string; checkIn: string; checkOut: string; }[] = []
  missingData: { attendanceDate: string; checkIn: string; checkOut: string; }[] = []
  earlyData: { attendanceDate: string; checkIn: string; checkOut: string; }[] = []


  employeeLeaveSummary: EmployeeLeaveSummary[] = [];
  teamSummary: TeamSummary[] = [];
  empId: string;
  summaryItems: { title: string; count: any; icon: string; color: string; percentage: string | number; id: string; }[] = [];
  startDate = '';
  endDate = new Date().toISOString();
  totalAttendance: number = 0;
  checkInSummary: ICheckInSummary;

  selectedOption: string = 'MTD';

  fileOptions: { value: string; name: string }[] = [
    { value: "MTD", name: "Month to Date" },
    { value: "YTD", name: "Year to Date" },
    { value: "PreviousYear", name: "Previous Year" },
    { value: "PreviousMonth", name: "Previous Month" },
    { value: "Last7Days", name: "Last 7 Days" }
  ];


  constructor(
    private api: ApiCallingService,
    private _localStorage: LocalStorageManagerService,
    private _toaster: ToastrService,
    private ngZone: NgZone
  ) {
    this.setFilter('MTD')

    this.empId = this._localStorage.getEmployeeDetail()[0].employeeId;
    this.emp = this._localStorage.getEmployeeDetail()[0];

  }

  ngAfterViewInit(): void {
    this.initializeTooltips();
  }

  ngOnInit(): void {
    this.initChart();
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

  private initChart(): void {
    const daysInMonth = 31; // Number of days in January
    const dailyStats = [
      { presents: 12, absents: 6, leaves: 5, late: 3, early: 2, halfDays: 1, offDays: 5, missingAttendance: 2 },
      { presents: 14, absents: 7, leaves: 6, late: 4, early: 3, halfDays: 2, offDays: 4, missingAttendance: 3 },
      { presents: 13, absents: 5, leaves: 4, late: 2, early: 1, halfDays: 0, offDays: 5, missingAttendance: 1 },
      // Add data for all 31 days...
      ...Array.from({ length: daysInMonth - 3 }, (_, i) => ({
        presents: Math.floor(Math.random() * 15),
        absents: Math.floor(Math.random() * 10),
        leaves: Math.floor(Math.random() * 8),
        late: Math.floor(Math.random() * 5),
        early: Math.floor(Math.random() * 4),
        halfDays: Math.floor(Math.random() * 3),
        offDays: Math.floor(Math.random() * 6),
        missingAttendance: Math.floor(Math.random() * 3),
      })),
    ];

    // Combine all the data into a single value per day (e.g., summing up all activities for each day)
    const combinedData = dailyStats.map((dayStats) => {
      return dayStats.presents + dayStats.absents + dayStats.leaves + dayStats.late + dayStats.early + dayStats.halfDays + dayStats.offDays + dayStats.missingAttendance;
    });

    // Create series data with combined values per day
    const seriesData = [{
      name: 'Total Attendance',
      data: combinedData,  // Use the combined data for each day
      color: 'blue',
    }];

    this.chartOptions = {
      credits: {
        enabled: false,
      },
      chart: {
        type: 'column',
      },
      title: {
        text: 'Attendance Summary - January',
      },
      xAxis: {
        categories: Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`), // Days 1 to 31
      },
      yAxis: {
        title: {
          text: 'Total Count',
        },
      },
      series: seriesData.map((series) => ({
        name: series.name,
        type: 'column',
        data: series.data,
      })),
    };
  }




  private updateSummaryItems(): void {

    const total = this.totalAttendance || 1;

    this.summaryItems = [
      {
        title: 'language.generic.absents',
        count: this.attendanceSummary.absents || 0,
        icon: 'fa-user-times',
        color: 'danger',
        percentage: ((this.attendanceSummary.absents / total) * 100).toFixed(2),
        id: "absendModal"
      },
      {
        title: 'language.generic.presents',
        count: this.attendanceSummary.presents || 0,
        icon: 'fa-user-check',
        color: 'success',
        percentage: ((this.attendanceSummary.presents / total) * 100).toFixed(2),
        id: ""
      },
      {
        title: 'language.generic.leaves',
        count: this.attendanceSummary.leaves || 0,
        icon: 'fa-calendar-day',
        color: 'info',
        percentage: ((this.attendanceSummary.leaves / total) * 100).toFixed(2),
        id: "employeeLeaveSummaryModal"
      },
      {
        title: 'language.generic.late',
        count: this.attendanceSummary.late || 0,
        icon: 'fa-clock',
        color: 'warning',
        percentage: ((this.attendanceSummary.late / total) * 100).toFixed(2),
        id: "lateDataModal"
      },
      {
        title: 'language.generic.early',
        count: this.attendanceSummary.early || 0,
        icon: 'fa-hourglass-half',
        color: 'primary',
        percentage: ((this.attendanceSummary.early / total) * 100).toFixed(2),
        id: "earlyDataModal"
      },
      {
        title: 'language.generic.halfDays',
        count: this.attendanceSummary.halfDays || 0,
        icon: 'fa-adjust',
        color: 'secondary',
        percentage: ((this.attendanceSummary.halfDays / total) * 100).toFixed(2),
        id: ""
      },
      {
        title: 'language.generic.offDays',
        count: this.attendanceSummary.offDays || 0,
        icon: 'fa-umbrella-beach',
        color: 'dark',
        percentage: ((this.attendanceSummary.offDays / total) * 100).toFixed(2),
        id: ""
      },
      {
        title: 'language.generic.missingAttendance',
        count: this.attendanceSummary.missingAttendance || 0,
        icon: 'fa-question-circle',
        color: 'muted',
        percentage: ((this.attendanceSummary.missingAttendance / total) * 100).toFixed(2),
        id: "missingDataModal"
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

          // Store check-in time in localStorage
          if (response.data.checkInSummary) {

            this._localStorage.saveCheckInTime(response.data.checkInSummary);
          }

          this.absentData = response.data.absentData;
          this.lateData = response.data.lateData;
          this.earlyData = response.data.earlyData;
          this.missingData = response.data.missingData;
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

          // Wait for view to be updated
          setTimeout(() => {
            this.initializeTooltips();
          }, 100);
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
        break;

      case 'YTD':
        this.startDate = formatDate(new Date(today.getFullYear(), 0, 1));
        this.endDate = formatDate(endOfDay);
        break;


      case 'QTD': {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        this.startDate = formatDate(new Date(today.getFullYear(), quarterStartMonth, 1));
        this.endDate = formatDate(endOfDay);
        break;
      }

      case 'PreviousYear': {
        const lastYear = today.getFullYear() - 1;
        this.startDate = formatDate(new Date(lastYear, 0, 1));
        this.endDate = formatDate(new Date(lastYear, 11, 31, 23, 59, 59, 999));
        break;
      }

      case 'PreviousMonth': {
        const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        this.startDate = formatDate(previousMonthStart);
        this.endDate = formatDate(previousMonthEnd);
        break;
      }

      case 'Last7Days': {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 6);
        lastWeek.setHours(0, 0, 0, 0);
        this.startDate = formatDate(lastWeek);
        this.endDate = formatDate(endOfDay);
        break;
      }

      default:
        console.error(`Invalid filter option: ${option}`);
        this.startDate = '';
        this.endDate = '';
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


              this.absentData = response.data.absentData;
              this.lateData = response.data.lateData;
              this.earlyData = response.data.earlyData;
              this.missingData = response.data.missingData;

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

              // Wait for view to be updated
              setTimeout(() => {
                this.initializeTooltips();
              }, 100);
            } else {
              this._toaster.error(response?.message || 'An error occurred');
              this.teamSummary = [];
            }
          },
          error: (error) => {
            this._toaster.error(error.message ||
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

  private initializeTooltips(): void {
    this.ngZone.runOutsideAngular(() => {
      // Dispose existing tooltips
      const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltips.forEach((element) => {
        const tooltip = bootstrap.Tooltip.getInstance(element);
        if (tooltip) {
          tooltip.dispose();
        }
      });

      // Initialize new tooltips with configuration
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: 'hover',
          placement: 'top',
          container: 'body'
        });
      });
    });
  }

}
