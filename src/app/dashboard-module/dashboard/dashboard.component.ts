import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DasAttendanceSummary, ResDasAttendanceSummary } from "../../types/index";
import { ApiCallingService } from "../../shared/Services/api-calling.service";
import { ToastrService } from 'ngx-toastr';
import { LocalStorageManagerService } from '../../shared/Services/local-storage-manager.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  attendanceData: DasAttendanceSummary;
  attendanceDataH
  empId: string;

  constructor(
    private api: ApiCallingService,
    private _localStorage: LocalStorageManagerService,
    private _toaster: ToastrService,
  ) {
    Chart.register(...registerables);
    this.empId = this._localStorage.getEmployeeDetail()[0].employeeId;
  }

  ngOnInit(): void {
    this.fetchAttendanceData();
  }

  private fetchAttendanceData() {
    // Hardcoded data for demonstration
    this.attendanceDataH = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03','2023-01-01', '2023-01-02', '2023-01-03'], // Example dates
        values: [10, 20, 30,10, 20, 30] // Example attendance values
    };
    this.initializeChart(); // Call the chart initialization method
  }

  private initializeChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (ctx) {
        new Chart(ctx, {
            type: 'bar', // or 'bar', etc.
            data: {
                labels: this.attendanceDataH.dates, // This should now work
                datasets: [
                    {
                        label: 'Attendance',
                        data: this.attendanceDataH.values, // This should now work
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Attendance Summary'
                    }
                }
            }
        });
    }
  }
}
