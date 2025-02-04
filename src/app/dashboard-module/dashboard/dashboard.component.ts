import { AfterViewInit, Component, OnInit, NgZone } from '@angular/core';
import * as Highcharts from 'highcharts';
import { TranslateModule } from '@ngx-translate/core';
import { ApiCallingService } from "../../shared/Services/api-calling.service";
import { ToastrService } from 'ngx-toastr';
import { LocalStorageManagerService } from '../../shared/Services/local-storage-manager.service';
import { AttendanceSummary, EmployeeDetail, EmployeeLeaveSummary, ICheckInSummary, ResDasSummary, TeamSummary, IGraphData } from "../../types/index";
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
  imports: [CommonModule, TranslateModule, FormsModule, DpDatePickerModule, ReactiveFormsModule, NgSelectModule, RouterModule, HighchartsChartModule, ConvertTimePipe],
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


  userReporting: {
    employeeId: string;
    fullName: string;
    punchCode: null | string;
  }[] = []

  attendanceSummary: AttendanceSummary = {} as AttendanceSummary;

  absentData: { date: string; }[] = [];
  lateData: { attendanceDate: string; checkIn: string; checkOut: string; }[] = []
  missingData: { attendanceDate: string; checkIn: string; checkOut: string; }[] = []
  earlyData: { attendanceDate: string; checkIn: string; checkOut: string; }[] = []

  graphData: IGraphData[] = [];

  employeeLeaveSummary: EmployeeLeaveSummary[] = [];
  teamSummary: TeamSummary[] = [];
  empId: string;
  summaryItems: { title: string; count: any; icon: string; color: string; percentage: string | number; id: string; }[] = [];
  startDate = '';
  endDate = new Date().toISOString();


  startDateCh = '';
  endDateCh = '';
  totalAttendance: number = 0;
  checkInSummary: ICheckInSummary;

  selectedOption: string = 'MTD';
  selectedOptionGraph: string = 'CM';

  fileOptions: { value: string; name: string }[] = [

    { value: "MTD", name: "Month to Date" },
    { value: "YTD", name: "Year to Date" },
    { value: "PreviousYear", name: "Previous Year" },
    { value: "PreviousMonth", name: "Previous Month" },
    { value: "Last7Days", name: "Last 7 Days" }
  ];

  fileOptionsGraph = [...this.fileOptions,   { value: "CM", name: "Current Month" }].filter(v => v.value == 'MTD' || v.value == 'PreviousMonth' || v.value == 'CM')


  constructor(
    private api: ApiCallingService,
    private _localStorage: LocalStorageManagerService,
    private _toaster: ToastrService,
    private ngZone: NgZone
  ) {
    this.setFilter('CM','Chart')
    this.setFilter('MTD')

    this.empId = this._localStorage.getEmployeeDetail()[0].employeeId;
    this.emp = this._localStorage.getEmployeeDetail()[0];
    this.getGraphStats()
  }

  ngAfterViewInit(): void {
    this.initializeTooltips();
  }

  ngOnInit(): void {
    this.fetchAttendanceData({
      startDate: this.startDate,
      endDate: this.endDate,
    });
    this.getUserReporting()
  }

  ngOnChanges(): void {
    if (this.attendanceSummary) {
      this.updateSummaryItems();
    }
  }

  getUserReporting(): void {
    this.api
      .getData('Attendance', 'getUserReportings', true, {
        employeeId: this.empId
      })
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
  private initChart(): void {
    const colorMapping = {
      0: '#f64e60', // Absent (Red)
      1: '#1bc5bd', // Present (Green)
      2: '#181c32', // Rejected (Red)
      3: '#8950fc', // Leave (Blue)
      4: '#6c757d',  // Off Day (Gray)
      5: '#ffa800'  // Up coming Day (Yellow)
    };

    // Create an array of statuses based on the dynamic data
    const dailyStats = this.graphData.map((data) => {
      // Convert time string to decimal hours
      const convertTimeToDecimalHours = (timeString: string): number => {
        if (!timeString) return 0;

        // Split the time string and remove any fractional seconds
        const [hours, minutes, seconds] = timeString.split(':').map(part => part.split('.')[0]);

        // Convert to decimal hours
        const decimalHours = parseFloat(hours) +
                              (parseFloat(minutes) / 60) +
                              (parseFloat(seconds) / 3600);

        return Number(decimalHours.toFixed(2)); // Round to 2 decimal places
      };

      return {
        dayName: data.dayName.slice(0,3),
        status: data.attendanceStatus,
        hours: data.attendanceTime ? convertTimeToDecimalHours(data.attendanceTime) : 0,
        attendanceDate: data.attendanceDate,
        attendanceType: data.attendanceType,
        isWorkingDay: data.isWorkingDay,
        onLeave: data.onLeave,
        totalShiftHours: data.totalShiftHours,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
      };
    });

    // Generate series data for Highcharts
    const seriesData: any[] = Object.keys(colorMapping).map((statusKey) => {
      const status = parseInt(statusKey);  // Convert string key to number (status)
      return {
        type: 'column',
        name: this.getStatusName(status),
        color: colorMapping[status],
        data: dailyStats
          .filter((stat) => {
            if (status === 4) {
              return !stat.isWorkingDay;
            }
            if (status === 3) {
              return stat.onLeave;
            }
            return stat.status === status && !stat.onLeave && stat.isWorkingDay;
          })
          .map((stat) => {
            const attendanceDate = new Date(stat.attendanceDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of the day

            return {
              x: attendanceDate.getDate() - 1,
              y: stat.hours > 0 ? stat.hours : this.convertTimeStringToNumber(stat.totalShiftHours),
              status: status,
              dayName: stat.dayName,
              attendanceType: stat.attendanceType,
              isWorkingDay: stat.isWorkingDay,
              onLeave: stat.onLeave,
              totalShiftHours: stat.totalShiftHours,
              attendanceDate: stat.attendanceDate,
              checkInTime: this.convertToTimeLocalFormat(stat.checkInTime),
              checkOutTime: this.convertToTimeLocalFormat(stat.checkOutTime),
              activeHours: this.calculateWorkingTime(stat.checkInTime, stat.checkOutTime),
              color: attendanceDate > today ? '#ffa800' : colorMapping[status], // Change color if future date
            };
          }),
        pointPadding: 0.1,
        groupPadding: 0.2,
        pointWidth: 20,
      };
    });


    this.chartOptions = {
      credits: {
        enabled: false,
      },
      chart: {
        type: 'column',
        spacingTop: 26,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      title: {
        text: this.getChartTitle(this.selectedOptionGraph)
      },
      xAxis: {
        categories: dailyStats.map((stat) => stat.dayName),
        title: { text: 'Days of the Week' },
        labels: {
          align: 'center',
          reserveSpace: true,
          enabled: true,
        },

      },
      yAxis: {
        title: {
          text: 'Attendance Hours',
        },
        max: dailyStats[0].totalShiftHours,
      },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      },
      tooltip: {

        formatter: function (this: Highcharts.Point & {
          dayName?: string;
          status?: number;
          hours?: number;
          attendanceType?: number;
          isWorkingDay?: boolean;
          onLeave?: boolean;
          attendanceDate?: string;
          checkInTime?: string | null;
          checkOutTime?: string | null;
          totalShiftHours?:string;
          activeHours?:string | number
        }) {
          // Check if it's an upcoming day
          const isUpcomingDay = this.status === 5 ||
            (this.attendanceDate && new Date(this.attendanceDate) > new Date());

          if (isUpcomingDay) {
            return `
              <b>Date: ${this.attendanceDate || 'N/A'}</b><br>
              Day: ${this.category || 'N/A'}<br>
              Status: Upcoming Day
            `;
          }
          else{
            return (this.isWorkingDay && (this.checkInTime || this.checkOutTime) && new Date(this.attendanceDate) < new Date()) ?  `
                <b>Date: ${this.attendanceDate || 'N/A'}</b><br>
                Day: ${this.category || 'N/A'}<br>
                Status: ${
                  this.status === 0 ? 'Absent' :
                  this.status === 1 ? 'Present' :
                  this.status === 2 ? 'Rejected' :
                  this.status === 3 ? 'Leave' :
                  this.status === 4 ? 'Off Day' :
                  this.status === 5 ? 'Upcoming Day' : 'N/A'
                }<br>
                Active Hours: ${this.activeHours || 0}<br>
                Attendance Type: ${this.attendanceType == 0 ? 'Default' : this.attendanceType == 1 ? 'Missing Attendance' : 'Remote Request'}<br>
                Check In: ${this.checkInTime || 'N/A'}<br>
                Check Out: ${this.checkOutTime || 'N/A'}<br>
                Working Day: ${this.isWorkingDay ? 'Yes' : 'No'}<br>
                On Leave: ${this.onLeave ? 'Yes' : 'No'}` : ( this.status == 0 ? `<b>Absent</b>` : `<b>Off Day</b>`);
          }

        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          groupPadding: 0.2,
          pointWidth: 20,
          stacking:'normal',
          dataLabels: {
            enabled: false
          },
        }
      },
      series: seriesData,
    };
  }

  private getStatusName(status: number): string {
    const statusNames = ['Absent', 'Present', 'Rejected', 'Leave', 'Off Day', 'Upcoming Day'];
    return statusNames[status];
  }


  getCurrentMonth(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonthIndex = new Date().getMonth();
    return months[currentMonthIndex];
  }

  private convertToTimeLocalFormat(dateString: string): string {
    if (dateString) {
      const date = new Date(dateString);

      // Convert to 12-hour format
      let hours = date.getHours();
      const minutes = date.getMinutes();

      // Convert 24-hour to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // If hours is 0, set to 12

      // Format with leading zeros for hours and minutes
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
      return formattedTime;
    }
    return ''
  }

  private calculateWorkingTime(startTime: string, endTime: string): string {

    if (!startTime || !endTime) {
      return 'N/A';
    }

    const start = new Date(startTime);
    const end = new Date(endTime);


    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));


    if (hours > 0 && minutes > 0) {
      return `${hours} hours ${minutes} mins`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else if (minutes > 0) {
      return `${minutes} mins`;
    } else {
      return '0 mins';
    }
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



  setFilter(option: string, filter: 'Chart' | 'Card' = 'Card'): void {
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const formatDate = (date: Date): string => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    let startDate: string;
    let endDate: string;

    switch (option) {
      case 'CM':
      startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      endDate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999));
      break;

      case 'MTD':
        startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        endDate = formatDate(endOfDay);
        break;

      case 'YTD':
        startDate = formatDate(new Date(today.getFullYear(), 0, 1));
        endDate = formatDate(endOfDay);
        break;

      case 'QTD': {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        startDate = formatDate(new Date(today.getFullYear(), quarterStartMonth, 1));
        endDate = formatDate(endOfDay);
        break;
      }

      case 'PreviousYear': {
        const lastYear = today.getFullYear() - 1;
        startDate = formatDate(new Date(lastYear, 0, 1));
        endDate = formatDate(new Date(lastYear, 11, 31, 23, 59, 59, 999));
        break;
      }

      case 'PreviousMonth': {
        const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        startDate = formatDate(previousMonthStart);
        endDate = formatDate(previousMonthEnd);
        break;
      }

      case 'Last7Days': {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 6);
        lastWeek.setHours(0, 0, 0, 0);
        startDate = formatDate(lastWeek);
        endDate = formatDate(endOfDay);
        break;
      }

      default:
        console.error(`Invalid filter option: ${option}`);
        startDate = '';
        endDate = '';
        return;
    }

    // Assign values based on the filter type
    if (filter === 'Chart') {
      this.startDateCh = startDate;
      this.endDateCh = endDate;
      this.selectedOptionGraph = option;
      this.getGraphStats();
    } else {
      this.startDate = startDate;
      this.endDate = endDate;
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


    getGraphStats(): void {
    try {

      this.api
        .getData('Dashboard', 'getChartData', true, { startDate: this.startDateCh, endDate: this.endDateCh, employeeId: this.emp.employeeId })
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.graphData = response.data;
              this.initChart()
            } else {
              this._toaster.error(response?.message || 'An error occurred');
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
    } catch (error) {
      console.log(error);

    }
  }

  private convertTimeStringToNumber(timeString: string): number {
    if (!timeString) return 0;

    // Split the time string
    const [hours, minutes] = timeString.split(':').map(Number);

    // Convert to number (e.g., '09:00' becomes 9)
    return hours;
  }

  private getChartTitle(option: string): string {
    const currentYear = new Date().getFullYear();

    switch(option) {
      case 'MTD':
        return `Attendance Summary - ${this.getCurrentMonth()} ${currentYear}`;
      case 'YTD':
        return `Attendance Summary - Year ${currentYear}`;
      case 'PreviousYear':
        return `Attendance Summary - Year ${currentYear - 1}`;
      case 'PreviousMonth': {
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(previousMonth);
        return `Attendance Summary - ${monthName} ${previousMonth.getFullYear()}`;
      }
      case 'Last7Days':
        return `Attendance Summary - Last 7 Days`;
      case 'CM':
        return `Attendance Summary - ${this.getCurrentMonth()} ${currentYear}`;
      default:
        return `Attendance Summary`;
    }
  }

}
