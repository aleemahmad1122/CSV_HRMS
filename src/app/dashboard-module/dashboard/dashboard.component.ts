import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ApiCallingService } from "../../shared/Services/api-calling.service";
import { ToastrService } from 'ngx-toastr';
import { LocalStorageManagerService } from '../../shared/Services/local-storage-manager.service';
import { AttendanceSummary, EmployeeLeaveSummary, ResDasSummary, TeamSummary } from "../../types/index";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  attendanceSummary: AttendanceSummary;
  employeeLeaveSummary: EmployeeLeaveSummary;
  teamSummary: TeamSummary[];
  empId: string;

  constructor(
    private api: ApiCallingService,
    private _localStorage: LocalStorageManagerService,
    private _toaster: ToastrService,
  ) {
    this.empId = this._localStorage.getEmployeeDetail()[0].employeeId;
  }

  ngOnInit(): void {
    this.fetchAttendanceData();
  }

  private fetchAttendanceData() {
    this.api.getData("Dashboard", `getDashboardSummary`, true, { employeeId: this.empId }).subscribe({
      next: (response: ResDasSummary) => {
        console.warn(response.data.teamSummary);

        if (response.success) {
          this.attendanceSummary = response.data.attendanceSummary;
          this.employeeLeaveSummary = response.data.employeeLeaveSummary;
          this.teamSummary = response.data.teamSummary;
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

}
